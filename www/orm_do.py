#!/usr/bin/env python3
# -*- coding: utf-8 -*-

__author__ = 'Laurent Huang'

import orm
import asyncio

from config import configs

from models import User,Blog,Comment




async def addUser():
	await orm.create_pool(loop=loop,user='root',password='',database='test')

	u = User(name='Test',email='test@zzz.com',passwd='1234567890',image='about:blank')

	await u.save()

	await orm.close_pool()


async def findUser():
	# 创建连接池


    # db_dict = {'user': conf.db.user, 'password': conf.db.password, 'database': conf.db.database}
    await orm.create_pool(loop=loop, **configs.db)

    u = User()
    
    # rs = await u.find() #查找所有用户
    rs = await u.find(orderBy='created_at desc')
    for item in rs:
    	print('name: %s, value: %s' % (item['name'],item['id']))

    await orm.close_pool()




loop = asyncio.get_event_loop()
loop.run_until_complete(findUser())
loop.close()


