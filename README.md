### Summary

创建schedule获取机票数据，监听符合条件的数据，通过短信发通知
机票数据通过携程的web api获取，短信服务调用阿里云短信

### Config

1. 添加机票出发地，目的地和机场code配置 `src/config/ctrip.json`
2. 添加阿里云短信accessKey value `src/config/secret.json` 由于存储密码 需要主动创建文件
3. 添加阿里云申请好的短信模板code `src/config/smsTemplate.json`
4. 关于云短信需要提前注册和审核好短信签名和短信模板签名 具体使用需要到对应的短信平台自学

### Usage

post `/getFlights`
post `/addSchedule`

### Coding

1. 如何创建新的service，首先在`src/contract`下的_mapping.ts文件定义好接口，入参出参
2. 使用命令`yarn gen`自动生成模板代码，如果service需要entity需要自己创建
3. 如果自定义的entity, service, controller需要被引用，在`src/module/customize`中添加导入代码


### Run & build

`yarn start` `yarn build`

### Deploy

1. 创建密码文件secret.json `src/config/secret.json`
   ```json
   {
    "sms": {
        "accessKeyId": "",
        "accessKeySecret": ""
    }
   }
   ```
2. build: `yarn build`
3. docker build image: `docker build -t matthew5/play-notice .`
4. docker run `docker run -d -p 3000:3000 --name play-notice matthew5/play-notice`



