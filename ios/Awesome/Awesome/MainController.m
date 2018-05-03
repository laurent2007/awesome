//
//  MainController.m
//  Awesome
//
//  Created by laurent on 2018/5/2.
//  Copyright © 2018年 laurent. All rights reserved.
//

#import "MainController.h"

@implementation MainController
-(void)viewDidLoad{
    [super viewDidLoad];

    self.title = @"最新日志";
    self.view.backgroundColor = [UIColor colorWithRed:0.5 green:0.5 blue:0.5 alpha:1];
    
    
    //读取日志数据，循环加载
    //从Python api端获取数据 -- /api/blogs
    
    
}

@end
