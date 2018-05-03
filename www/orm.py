#!/usr/bin/env python3
# -*- coding: utf-8 -*-

__author__ = 'Laurent Huang'

import logging; logging.basicConfig(level=logging.INFO)
import asyncio
import aiomysql
import sys



def log(sql,args=()):
	logging.info('SQL: %s' % sql)



#我们需要创建一个全局的连接池，每个HTTP请求都可以从连接池中直接获取数据库连接。使用连接池的好处是不必频繁地打开和关闭数据库连接，而是能复用就尽量复用。
# @asyncio.coroutine
async def create_pool(loop,**kw): 
	logging.info('create database connection pool...')
	global __pool
	__pool = await aiomysql.create_pool(
		host = kw.get('host','localhost'),
		port = kw.get('port',3306),
		user = kw['user'],
		password = kw['password'],
		db = kw['database'],
		charset = kw.get('charset','utf8'),
		autocommit = kw.get('autocommit',True),
		maxsize = kw.get('maxsize',10),
		minsize = kw.get('minsize',1),
		loop = loop
	)
	

# 关闭连接池
async def close_pool():
	'''异步关闭连接池'''
	logging.info('close database connection pool...')
	global __pool
	__pool.close()
	await __pool.wait_closed()


async def select(sql,args,size=None):
	'''此处为选取数据库相关数据操作'''
	log(sql,args)
	global __pool
	async with __pool.get() as conn: #从连接池获取一个connect
		async with conn.cursor(aiomysql.DictCursor) as cur: #获取游标cursor
			await cur.execute(sql.replace('?','%s'),args or ()) #将输入的sql语句中的'？'替换为具体参数args
			if size:
				rs = await cur.fetchmany(size)
			else:
				rs = await cur.fetchall()
		# await cur.close()
		
		logging.info('rows returned: %s' % len(rs))
		return rs

# SQL语句的占位符是?，而MySQL的占位符是%s，select()函数在内部自动替换。注意要始终坚持使用带参数的SQL，而不是自己拼接SQL字符串，这样可以防止SQL注入攻击。

# 注意到yield from将调用一个子协程（也就是在一个协程中调用另一个协程）并直接获得子协程的返回结果。

# 如果传入size参数，就通过fetchmany()获取最多指定数量的记录，否则，通过fetchall()获取所有记录。



async def execute(sql,args,autocommit=True):
	'''此处执行数据库删减、增添等修改该操作'''
	log(sql,args)
	async with __pool.get() as conn:
		if not autocommit:
			await conn.begin()
		try:
			# test code
			# print('execute start') 
			# s = sql.replace('?','%s'),args
			# print('execute sql.replace():',s)
			# print('execute end') 
			async with conn.cursor(aiomysql.DictCursor) as cur:
				await cur.execute(sql.replace('?','%s'),args)
				affected = cur.rowcount
				# print('execute affected:',affected)
			if not autocommit:
				await conn.commit()
		except BaseException as e:
			if not autocommit:
				await conn.rollback()
			raise
		return affected #返回修改行


# 创建拥有几个占位符的字符串
def create_args_string(num):
	L = []
	for n in range(num):
		L.append('?')
	return ', '.join(L)


class Field(object):
	'''用于标识model每个成员变量的类

    name:表名称， column_type:值类型， primary_key：是否主键'''
	def __init__(self,name,column_type,primary_key,default):
		self.name = name
		self.column_type = column_type
		self.primary_key = primary_key
		self.default = default

	def __str__(self):
		return '<%s,%s:%s>' % (self.__class__.__name__,self.column_type,self.name)

class StringField(Field):
	def __init__(self,name=None,primary_key=False,default=None,ddl='varchar(100)'):
		super().__init__(name,ddl,primary_key,default)

class BooleanField(Field):
	def __init__(self,name=None,default=False):
		super().__init__(name,'boolean',False,default)

class IntegerField(Field):
	def __init__(self,name=None,primary_key=False,default=0):
		super().__init__(name,'bigint',primary_key,default)

class FloatField(Field):
    def __init__(self, name=None, primary_key=False, default=0.0):
        super().__init__(name, 'real', primary_key, default)


class TextField(Field):
    def __init__(self, name=None, default=None):
        super().__init__(name, 'text', False, default)



class ModelMetaclass(type):
	def __new__(cls,name,bases,attrs):
		# 排除Model类本身:
		if name =='Model':
			return type.__new__(cls,name,bases,attrs)

		# 获取table名称:
		tableName = attrs.get('__table__',None) or name
		# logging.info('found model: %s (table: %s)' % (name,tableName))

		# 获取所有的Field和主键名:
		mappings = dict()
		fields = [] #可以理解为列名称
		primaryKey = None
		# print(attrs.items())
		for k,v in attrs.items():
			if isinstance(v,Field):
				# logging.info(' found mapping: %s ==> %s' % (k,v))
				mappings[k] = v
				if v.primary_key:
					# 找到主键:
					if primaryKey:
						raise RuntimeError('Duplicate primary key for field: %s ' % k)
					primaryKey = k
				else:
					fields.append(k)

		if not primaryKey:
			raise RuntimeError('Primary key not found')

		for k in mappings.keys():
			attrs.pop(k)  #删除attrs里属性，防止与实例属性冲突
 
		escaped_fields = list(map(lambda f: '`%s`' % f,fields))
		attrs['__mappings__'] = mappings #保存属性和列的映射关系
		attrs['__table__'] = tableName
		attrs['__primary_key__'] = primaryKey # 主键的属性名
		attrs['__fields__'] = fields # 除主键外的属性名

		# 构造默认的SELECT, INSERT, UPDATE和DELETE语句:
		attrs['__select__'] = 'select  `%s`, %s from `%s`' % (primaryKey,', '.join(escaped_fields),tableName)
		attrs['__insert__'] = 'insert into `%s` (%s, `%s`) values (%s)' % (tableName,', '.join(escaped_fields),primaryKey,create_args_string(len(escaped_fields) + 1))
		attrs['__update__'] = 'update `%s` set %s where `%s`=?' % (tableName,', '.join(map(lambda f: '`%s`=?' % (mappings.get(f).name or f),fields)),primaryKey)
		attrs['__delete__'] = 'delete from `%s` where `%s`=?' % (tableName,primaryKey)

		return type.__new__(cls,name,bases,attrs)


#首先要定义的是所有ORM映射的基类Model：
class Model(dict,metaclass=ModelMetaclass):

	def __init__(self,**kw):
		super(Model,self).__init__(**kw)

	def __getattr__(self,key):
		try:
			return self[key]
		except KeyError:
			raise AttributeError(r"'Model' object has no attribute '%s'" % key)

	def __setattr__(self,key,value):
		self[key] = value

	def getValue(self,key):
		return getattr(self,key,None)

	def getValueOrDefalut(self,key):
		value = getattr(self,key,None)
		# print('getValueOrDefalut getattr(self,key,None):',getattr(self,key,None)) #city,id,name 的值
		if value is None:
			field = self.__mappings__[key]
			if field.default is not None:
				value = field.default() if callable(field.default) else field.default
				logging.debug('using default value for %s: %s' % (key,str(value)))
				setattr(self,key,value)
		return value

	@classmethod		
	async def find(cls,where=None,args=None,**kw):
		' find objects by where clause'
		sql = [cls.__select__]
		if where:
			sql.append('where')
			sql.append(where)
		if args is None:
			args = []
		orderBy = kw.get('orderBy',None)
		if orderBy:
			sql.append('order by')
			sql.append(orderBy)
		limit = kw.get('limit',None)
		if limit is not None:
			sql.append('limit')
			if isinstance(limit,int):
				sql.append('?')
				args.append(limit)
			elif isinstance(limit,tuple) and len(limit) ==2:
				sql.append('?,?')
				args.extend(limit)
			else:
				raise ValueError('Invalid limit value: %s' % str(limit))
		rs  = await select(' '.join(sql),args)
		return [cls(**r) for r in rs]

	@classmethod	
	async def findNumber(cls,selectField,where=None,args=None):  # 根据WHERE条件查找，但返回的是整数，适用于select count(*)类型的SQL。
		' find number by select and where'
		sql = ['select %s _num_ from `%s` ' %(selectField,cls.__table__)]
		if where:
			sql.append(' where ')
			sql.append(where)
		rs  = await select(' '.join(sql),args,1)
		if len(rs) == 0 :
			return None
		return rs[0]['_num_']
		
	@classmethod
	async def findById(cls,pk):
		'find object by primary key'
		#test code
		# print('find start')
		# print('%s where `%s`=?' % (cls.__select__,cls.__primary_key__))
		# print('find end')

		rs = await select('%s where `%s`=?' % (cls.__select__,cls.__primary_key__),[pk],1)
		if len(rs) ==0:
			return None
		return cls(**rs[0])
		
	async def save(self):
		args = list(map(self.getValueOrDefalut,self.__fields__))
		args.append(self.getValueOrDefalut(self.__primary_key__))

		# Test Code
		# print('save start')
		# print('save self:',self)
		# print('save map(self.getValueOrDefalut,self.__fields__):',map(self.getValueOrDefalut,self.__fields__))
		# print('save list(map(self.getValueOrDefalut,self.__fields__)):',list(map(self.getValueOrDefalut,self.__fields__))) #none
		# print('save self.getValueOrDefalut:',self.getValueOrDefalut)
		# print('save self.__fields__:',self.__fields__)  #'name'
		# print('save args:',args)  #'None'
		# print('save self.__primary_key__:',self.__primary_key__)
		# print('save self.getValueOrDefalut(self.__primary_key__):', self.getValueOrDefalut(self.__primary_key__))
		

		# mymap = map(self.getValueOrDefalut,self.__fields__)
		# for item in mymap:
		# 	print('save mymap: ',item)

		print('save self.__insert__:',self.__insert__)
		print('save args:',args)  #'None'
		print('save end')
		
		rows = await execute(self.__insert__,args)
		if rows != 1:
			logging.warn('failed to insert record: affected rows: %s' % rows)
			
	async def update(self):
		args = list(map(self.getValue,self.__fields__))
		args.append(self.getValue(self.__primary_key__))	
		rows = await execute(self.__update__,args)
		if rows != 1:
			logging.warn('failed to update by primary key: affected rows: %s' % rows)
	
	async def remove(self):
		args = [self.getValue(self.__primary_key__)]
		rows = await execute(self.__delete__,args)
		if rows != 1:
			logging.warn('failed to remove by primary key: affected rows: %s' % rows)


# 请移步models.py
# class User(Model):
# 	__table__ = 'users'
# 	id = IntegerField(primary_key=True)
# 	name = StringField()
	

