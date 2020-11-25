#### 目标
目前小程序的发布是通过`微信开发者工具`手动操作，在开发和测试的协作上不太便捷，另外`Unit test` 和 `SonarQube scan`等CI process无法自动化。这次探究的目的就是为了解决这些问题，把小程序的发布接入Jenkins CICD。

#### 可行性
小程序官方提供了[miniprogram-ci](https://www.npmjs.com/package/miniprogram-ci)，它是从微信开发者工具中抽离的关于小程序/小游戏项目代码的编译模块。开发者可不打开小程序开发者工具，独立使用 miniprogram-ci 进行小程序代码的上传、预览等操作。通过集成CI工具到Jenkins job中，理论上就可以完成小程序的CICD发布。

#### 环境搭建
这次小程序CICD是在local环境下完成，通过docker运行Jenkins和SonarQube服务，小程序示例项目（该项目与保洁业务无关，是为了本次实验单独编写的样例）存放在个人github上。完整的CICD服务环境如下图：
![CICD env](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/env.png)

#### Jenkins job创建
我们选择了`Multibranch Pipeline`类型来创建Jenkins job，命名为mini-program-multi，因为我们项目存在dev和master两条分支，所以Jenkins会自动为我们在该job下创建与分支对应的subjob, 每个subjob的pipeline描述来自对应分支的Jenkinsfile文件。如下图所示：
![mutilbranch pipeline](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/multibranch%20_job.png?token=AB2VJHUODHRKP3UFZX6DBW27XXFNS)

#### Pipeline说明
pipeline有几个stage，如下图所示
![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/pipeline_stages.png?token=AB2VJHVFBOGPMEUAURSIXU27XS4AY)
Checkout SCM: 从github拉去代码
Tool Install：这个阶段会安装node.js
prepare environment: 执行yarn install安装项目依赖
test: 执行项目单元测试
SonarQube: 对项目源代码进行SonarQube扫描，如果通过则发布小程序
Preivew: 只有SonarQube通过并且当前分支是dev时才执行，提交小程序预览请求，如果成功在Job运行结果页面可以得到预览二维码
deploy: 只有SonarQube通过并且当前分支是master时才执行，提交小程序上传请求，如果成功就可以在微信公众号平台版本管理中看到提交的版本

Jenkinsfile文件定义请参阅 https://github.com/unnKoel/mini-program-pipeine-doc/blob/master/Jenkinsfile

#### 实验结果
项目unit test只多了一小部分，test coverage为5.6%，先把SonarQube的quality gates的coverage条件调整到less then 7%，来观察dev 和master这两个subjob是否都会因为SonarQube扫描不通过而提前终止，无法执行后续preview或deploy stage。
![quality gate unsatisfied](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/SonarQube_quality_gate.png?token=AB2VJHQWIRORHVVHVNPAJXK7XXAS4)
1. dev预览job
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/dev_gate_fail.png?token=AB2VJHXP66QGQI57MPTCSPK7XXAWS)
   如上图，job在SonarQube阶段失败。失败日志表明没有通过SonarQube gate，如下
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/dev_gate_fail_logs.png?token=AB2VJHS6EFAPUC4YVDSDBSC7XXAZE)
2. master上传发布job
   job运行结果与dev预览job一样，都因为SonarQube扫描失败而失败
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/master_gate_fail.png?token=AB2VJHVJ4LDZN5Y4CBODZHK7XXEPU)
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/gate_fail_logs.png?token=AB2VJHV5QPGR65QUZ3UEX3S7XXEXC)

然后我们调整SonarQube的quality gates的coverage条件调整到less then 5%，项目的实际coverage大于5%，因此SonarQube扫描的结果应该通过，并执行后续的preview或deploy stage.我们来看下job运行下来的结果：
1. dev 预览job
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/dev_job_success.png?token=AB2VJHXSM4JJ6CKJJZP5WF27XXE2A)
   如上图，job运行成功。我们在job结果描述中也可以看到小程序预览二维码，直接扫描就可以预览小程序
  ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/dev_job_suceess_qr.png?token=AB2VJHTJUGSPF2POGUM5X4C7XXE4M)

2. master上传发布job
   我们输入小程序发布参数，版本号为1.8，描述为release for new version，然后启动job
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/master_parameters.png)
   最终job运行成功
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/master_job_success.png?token=AB2VJHREKL4LRMP6K2KXRSS7XXFA6)
   我们到小程序公众平台下,看到了刚才job发布的小程序新版本
   ![](https://raw.githubusercontent.com/unnKoel/mini-program-pipeine-doc/master/doc/deploy_wechat.png?token=AB2VJHVE2DOAOEIIEYJGGPS7XXFEM)
       
  