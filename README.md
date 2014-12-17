# AngularMin
### Complete [AngularJS](http://www.angularjs.org/) project boilerplate.
### [Check out AngularMin](http://code.oa.com/v2/svn/adpf_aurora_rep/angularmin_proj/trunk)

-----------------------------

## 设计说明

### 设计原则

 - 模块化 - 每个JS文件对应一个模块，模块之间声明依赖关系
 - 自动化测试

    - 基础模块对应UT测试用例
    - 业务模块对应UT与E2E测试用例
    - 测试用例作为文档

### 目录结构原则

 - 隔离原则

    - 第三方隔离

        - 第三方代码与主体代码隔离
        - 不同来源的代码相互隔离

    - 业务隔离

        - 基础层与业务层隔离
        - 不同业务间的代码相互隔离
        - 业务代码与测试代码隔离


 - 聚合原则

    - 相同更新频率的文件放在一起
    - 相同业务的代码放在一起

### 整体结构

 - 主体代码分为app和common两个文件夹

    - common 对应基础层
    - app 对应业务层，内部按业务分目录

 - 主体代码与第三方代码分开，第三方代码按来源分目录
 - 主体代码与测试用例分开，测试用例按业务分目录

### 命名规则

 - 文件夹名称与业务名称对应
 - JS文件名与angular模块名对应
 - 测试用例名称与JS文件名称对应

### 构建过程

 - 清空目标文件夹
 - 合并第三方库到目标文件夹
 - 拷贝源文件与图片资源至目标文件夹
 - 编译less文件
 - 自动为CSS文件添加prefix

 - 发布优化：

   - 处理angular源文件依赖声明
   - 压缩脚本并生成Map文件
   - 优化图片
   - 清理未压缩的脚本
   - 向静态资源添加MD5后缀

 - 自动生成脚本引用

------------

## Purpose

AngularMin means Angular for Admin. 

This project is a instance about how to build web app with AngularJS.
Developers can start new project with it.

## Features

 - Contain a mock server, no backend dependacy.
 - Handy components.
 - Bulinding scripts.
 - UT and E2E test.

## How to use

### install

 - install nodejs and npm first
 - client>npm install
 - server>npm install
 
### Start mock server
 - server>node app

### Build the project
 - client>grunt build
 
### Start watching file chages
 - client>grunt watch

### Start unit test task(optional)
 - client>grunt karma watch

### Start E2E test(optional)
 - client\test\e2e>protractor config.js

### Release project
 - client>grunt release

-----------------------------

## Change log:

### v0.4.0:
Add BrowserSync test server.

### v0.3.0:
Add static asset revisioning.
Add base less mixins.

### v0.2.0:
Support for LESS.
Support for modernizr.
Add release build script.
CRM features.







