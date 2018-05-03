#!/usr/bin/env python3
# -*- coding: utf-8 -*-

__author__ = 'Laurent Huang'


'''
config_override.py
正式服务器环境配置

'''


configs = {
	'db' : {
		'host':'127.0.0.1',
		'port':3306,
		'user':'root',
		'password':'123456',
		'database':'awesome'
	},
	'session':{
		'secret':'AwEsOmE'
	}
}
