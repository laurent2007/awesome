#!/usr/bin/env python3
# -*- coding: utf-8 -*-

__author__ = 'Laurent Huang'


' url handlers '

# 导入命名空间

import re,time,json,logging,hashlib,base64,asyncio

import markdown2

from aiohttp import web

from coroweb import get,post

from apis import Page,APIError,APIValueError,APIResourceNotFoundError,APIPermissionError

from models import User,Comment,Blog,next_id

from config import configs

# 参数变量

COOKIE_NAME = 'awesession'
_COOKIE_KEY = configs.session.secret

_RE_EMAIL = re.compile(r'^[a-z0-9\.\-\_]+\@[a-z0-9\-\_]+(\.[a-z0-9\-\_]+){1,4}$')
_RE_SHA1 = re.compile(r'^[0-9a-f]{40}$')

# 私有处理函数

def check_admin(request):
	if request.__user__ is not None or request.__user__.admin:
		return APIPermissionError()

def get_page_index(page_str):
	p = 1
	try:
		p = int(page_str)
	except ValueError as e:
		pass
	if p < 1:
		p = 1
	return p

def user2cookie(user,max_age):
	'''
	Generate cookie str By user
	'''
	#build cookie string by: id-expires-sha1
	expires = str(int(time.time() + max_age))
	s = '%s-%s-%s-%s' % (user.id,user.passwd,expires,_COOKIE_KEY)
	L = [user.id,expires,hashlib.sha1(s.encode('utf-8')).hexdigest()]
	return '-'.join(L)

def text2html(text):
	lines = map(lambda s:'<p> %s </p>' % s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;'),filter(lambda s: s.strip() !='',text.split('\n')))
	return ''.join(lines)

async def cookie2user(cookie_str):
	'''
	Parse cookie  and load user if cookie is valid
	'''
	if not cookie_str:
		return None
	try:
		L = cookie_str.split('-')
		if len(L) != 3:
			return None
		uid,expires,sha1 = L
		if int(expires) < time.time():
			return None
		user  = await User.findById(uid)
		if user is None:
			return None
		s = '%s-%s-%s-%s' % (uid,user.passwd,expires,_COOKIE_KEY)
		if sha1 != hashlib.sha1(s.encode('utf-8')).hexdigest():
			logging.info('invalid sha1')
			return None
		user.passwd = '*****'
		return user
	except Exception as e:
		logging.exception(e)
		return None


# Part1.后端API
# 用户验证
@post('/api/authenticate')
async def authenticate(*,email,passwd):
	if not email:
		raise APIValueError('email','Invalid email')
	if not passwd:
		raise APIValueError('passwd','Empty password')
	users = await  User.find('email=?',[email])
	if len(users) == 0:
		raise APIValueError('email','Email not exist')
	user  =users[0]

	sha1_passwd = '%s:%s' % (user.id,passwd)
	if user.passwd != hashlib.sha1(sha1_passwd.encode('utf-8')).hexdigest():
		raise APIValueError('passwd','Invalid password')
	# authenticate ok, set cookie:
	r = web.Response()
	r.set_cookie(COOKIE_NAME,user2cookie(user,86400),max_age=86400,httponly=True)
	user.passwd = '****'
	r.content_type = 'application/json'
	r.body = json.dumps(user,ensure_ascii=False).encode('utf-8')
	return r

# 用户注册
@post('/api/users')
async def api_register_user(*,email,name,passwd):
	if not name or not name.strip():
		raise APIValueError('name')
	if not email or not _RE_EMAIL.match(email):
		raise APIValueError('email')
	if not passwd or not _RE_SHA1.match(passwd):
		raise APIValueError('password')
	users = await User.find('email=?',[email])
	if len(users) > 0 :
		raise APIError('register:failed','email','Email is already in use.')
	uid = next_id()

	sha1_passwd = '%s:%s' % (uid,passwd)
	user = User(id=uid,name=name.strip(),passwd=hashlib.sha1(sha1_passwd.encode('utf-8')).hexdigest(),admin=1,email=email.strip(),image='https://en.gravatar.com/userimage/138353628/c407ce152b8c8a6dc34112e57bdbeb73.jpg?size=200')
	await user.save()
	# make session cookie:
	r = web.Response()
	r.set_cookie(COOKIE_NAME,user2cookie(user,86400),max_age=86400,httponly=True)
	user.passwd = '****'
	r.content_type = 'application/json'
	r.body = json.dumps(user,ensure_ascii=False).encode('utf-8')
	return r

# 获取所有用户
@get('/api/users')
async def api_users(*,page = 1):
	page_index = get_page_index(page)
	num = await User.findNumber('count(id)')
	p = Page(num,page_index)
	if num == 0:
		return dict(page=p,users=())
	users = await User.find(orderBy='created_at desc',limit=(p.offset,p.limit))
	return dict(page=p,users = users)

# 设置用户为管理员
@post('/api/user/{id}/admin')
async def api_admin_user(request,*,id):
	check_admin(request)
	user = await User.findById(id)
	# print('api_admin_user:',user)
	if user is not None:
		admin = user.admin
		if admin == 0 :
			user.admin = 1
		else:
			user.admin = 0
		await user.update()

	return user


# 获取所有日志
@get('/api/blogs')
async def api_blogs(*,page='1'):
	
	page_index = get_page_index(page)
	num = await Blog.findNumber('count(id)')
	p = Page(num,page_index)
	checkedModel = []
	if num ==0:
		return dict(page=p,blogs=())
	blogs = await Blog.find(orderBy='created_at desc',limit=(p.offset,p.limit))
	for blog in blogs:
		checkedModel.append('false')
	return dict(page=p,blogs=blogs,checkedModel=checkedModel)

# 获取日志根据日志ID
@get('/api/blogs/{id}')
async def api_get_blog(*,id):
	blog = await Blog.findById(id)
	return blog

# 创建日志
@post('/api/blogs')
async def api_create_blog(request,*,name,summary,content):
	check_admin(request)
	# print('api_create_blog')
	if not name or not name.strip():
		raise APIValueError('name','name cannot be empty')
	if not summary or not summary.strip():
		raise APIValueError('summary','summary cannot be empty')
	if not content or not content.strip():
		raise APIValueError('content','content cannot be empty')
	blog = Blog(user_id=request.__user__.id,user_name = request.__user__.name,user_image=request.__user__.image,name=name.strip(),summary=summary.strip(),content = content.strip())
	await blog.save()
	return blog

# 更新日志
@post('/api/blogs/{id}')
async def api_update_blog(id,request,*,name,summary,content):
	check_admin(request)
	blog = await Blog.findById(id)
	if not name or not name.strip():
		raise APIValueError('name','name cannot be empty')
	if not summary or not summary.strip():
		raise APIValueError('summary','summary cannot be empty')
	if not content or not content.strip():
		raise APIValueError('content','content cannot be empty')
	blog.name = name.strip()
	blog.summary = summary.strip()
	blog.content = content.strip()
	await blog.update()
	return blog

# 删除日志
@post('/api/blogs/{id}/delete')
async def api_delete_blog(request,*,id):
	check_admin(request)
	blog = await Blog.findById(id)
	await blog.remove()
	return dict(id=id)

# 发表评论
@post('/api/blogs/{id}/comments')
async def api_create_comments(id,request,*,content):
	user = request.__user__
	if user is None:
		raise APIPermissionError('Please signin first.')
	if not content or not content.strip():
		raise APIValueError('content')
	blog = await Blog.findById(id)
	if blog is None:
		raise APIResourceNotFoundError('Blog')
	comment = Comment(blog_id = blog.id,user_id = user.id,user_name = user.name,user_image = user.image,content= content.strip())
	await comment.save()
	return comment


# 获取所有评论
@get('/api/comments')
async def api_comments(*,page='1'):
	
	page_index = get_page_index(page)
	num = await Comment.findNumber('count(id)')
	p = Page(num,page_index)
	if num ==0:
		return dict(page=p,comments=())
	comments = await Comment.find(orderBy='created_at desc',limit=(p.offset,p.limit))
	return dict(page=p,comments=comments)

# 删除评论
@post('/api/comments/{id}/delete')
async def api_delete_comment(request,*,id):
	check_admin(request)
	comment = await Comment.findById(id)
	await comment.remove()
	return dict(id=id)


# Part2.管理页面

# 管理首页
@get('/manage/')
def manage():
	return 'redirect:/manage/blogs'

# 日志管理首页
@get('/manage/blogs')
def manage_blogs(*,page='1'):
	return{
		'__template__':'manage_blogs.html',
		'page_index':get_page_index(page)
	}

# 日志创建页
@get('/manage/blogs/create')
def manage_create_blog():
	return {
		'__template__': 'manage_blog_edit.html',
		'id':'',
		'action':'/api/blogs'
	}

# 日志编辑页
@get('/manage/blogs/edit')
def manage_edit_blog(*,id):
	return {
		'__template__': 'manage_blog_edit.html',
		'id':id,
		'action':'/api/blogs/%s' % id
	}


# 用户管理首页
@get('/manage/users')
def manage_users(*,page='1'):
	return{
		'__template__':'manage_users.html',
		'page_index':get_page_index(page)
	}

# 评论管理首页
@get('/manage/comments')
def manage_comments(*,page='1'):
	return{
		'__template__':'manage_comments.html',
		'page_index':get_page_index(page)
	}


# Part3.用户浏览页面
# 主页
@get('/')
async def index(request,*,page='1'):

	page_index = get_page_index(page)
	num = await Blog.findNumber('count(id)')
	p = Page(num,page_index,page_size=5)
	if num == 0:
		return {
			'__template__':'blogs.html',
			'blogs':(),
			'page':p
		}

	blogs = await Blog.find(orderBy='created_at desc',limit=(p.offset,p.limit))

	return {
		'__template__':'blogs.html',
		'blogs':blogs,
		'page':p
	}

# 日志明细页
@get('/blog/{id}')
async def get_blog(id):
	blog = await Blog.findById(id)
	comments = await Comment.find('blog_id=?',[id],orderBy='created_at desc')
	for c in comments:
		c.html_content = text2html(c.content)
	blog.html_content = markdown2.markdown(blog.content)
	return{
		'__template__':'blog.html',
		'blog':blog,
		'comments':comments
	}

# 用户注册
@get('/register')
def register():
	return {
		'__template__':'register.html'
	}

# 用户登录
@get('/signin')
def signin():
	return {
		'__template__':'signin.html'
	}

# 用户登出
@get('/signout')
def signout(request):
	referer = request.headers.get('Referer')
	r = web.HTTPFound(referer or '/')
	r.set_cookie(COOKIE_NAME,'-deleted-',max_age=0,httponly=True)
	logging.info('user signed out')
	return r