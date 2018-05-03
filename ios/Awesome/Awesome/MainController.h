//
//  MainController.h
//  Awesome
//
//  Created by laurent on 2018/5/2.
//  Copyright © 2018年 laurent. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
@interface MainController : UIViewController
<UITableViewDelegate,
UITableViewDataSource>
{
    UITableView* _tableView;
    NSMutableArray* _arrayData;
    
    //定义数据库管理
    //FMDatabase* _mDB;
    
    UILabel* _lblEmpty;
    UIButton* _goBtn;
}
@end
