#!/usr/bin/env python3
# -*- coding: utf-8 -*-

__author__ = 'Laurent Huang'



import asyncio
import aiomysql
import orm


from orm import User


#链接数据库
def connDB(loop):
	# 创建连接池
    db_dict = {'user': 'root', 'password': '', 'db': 'test'}
    orm.create_pool(loop=loop, **db_dict)

#关闭数据库
def closeDB(loop):
	orm.close_pool()

# 新增用户
async def addUser(loop):
    # 创建连接池
    db_dict = {'user': 'root', 'password': '', 'db': 'test'}
    await orm.create_pool(loop=loop, **db_dict)
    # await connDB(loop)
    u = User(id='9999',name='Test129999')
    await u.save()
    # await closeDB(loop)
    await orm.close_pool()

# 编辑用户
async def editUser(loop):
	# 创建连接池
    db_dict = {'user': 'root', 'password': '', 'db': 'test'}
    await orm.create_pool(loop=loop, **db_dict)
    u = User(id='1234',name='Test1234')
    await u.update()
    await orm.close_pool()

# 删除用户
async def removeUser(loop):
	# 创建连接池
    db_dict = {'user': 'root', 'password': '', 'db': 'test'}
    await orm.create_pool(loop=loop, **db_dict)
    u = User(id='1234')
    await u.remove()
    await orm.close_pool()

# 根据条件查找用户
async def findUser(loop):
	# 创建连接池
    db_dict = {'user': 'root', 'password': '', 'db': 'test'}
    await orm.create_pool(loop=loop, **db_dict)
    u = User()
    
    # rs = await u.find() #查找所有用户
 
    rs = await u.find(where='name = \'Test\'') # 查找用户名为Test的用户

    for item in rs:
    	print('name: %s, value: %s' % (item['name'],item['id']))

    await orm.close_pool()


# 根据主键查找用户
async def findUserById(loop):
	# 创建连接池
    db_dict = {'user': 'root', 'password': '', 'db': 'test'}
    await orm.create_pool(loop=loop, **db_dict)
    
    u = User()
    
    rs = await u.findById('9999')
    print(rs)
    await orm.close_pool()


# 执行函数操作
loop = asyncio.get_event_loop()
loop.run_until_complete(findUser(loop))
loop.close()



# if __name__ == '__main__':

# 	loop = asyncio.get_event_loop()
# 	loop.run_until_complete(create_pool(host='127.0.0.1', port=3306,user='root', password='',db='test', loop=loop))
# 	rs = loop.run_until_complete(select('select * from user',None))

# 	# 获取到了数据库返回的数据
# 	print("heh:%s" % rs)
# 	# 关闭 数据库连接池
# 	loop.run_until_complete(close_pool())

# 	loop.close()
# 	if loop.is_closed():
# 		sys.exit(0)