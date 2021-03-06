const app = getApp(),
  icon = app.requirejs('icons'),
  c = app.requirejs('core'),
  MAX = 60;
Page({
  data: {
    icon: icon,
    code: '',
    mobile: '',
    checked: true,
    isError: false,
    issubmit: false,
    errortext: '',
    scode: ''
  },
  onLoad (options) {
    this.WxValidate = app.wxValidate(
      {
        mobile: {
          required: true,
          tel: true,
        },
        code: {
          required: true
        },
        password: {
          required: true,
          minlength: 6,
          maxlength: 16
        },
        repassword: {
          required: true,
          minlength: 6,
          maxlength: 16
        }
      }
      , {
        mobile: {
          required: '请填写您的手机号',
          tel: '请填写正确的手机号码格式'
        },
        code: {
          required: '请输入验证码',
        },
        password: {
          required: '请填写正确的密码格式',
        },
        repassword: {
          required: '请填写正确的密码格式',
        }
      }
    )
  },
  onShow () {
    const code = app.getCache('code') || 0;
    this.setData({
      code
    });
    if (code > 0) {
      this.countdown();
    }
  },
  mobilevalue(e) {
    this.setData({
      mobile: e.detail.value
    });
  },
  checkMobile (value) {
    return /^1[34578]\d{9}$/.test(value);
  },
  getCode(e) {
    if (this.data.code > 0) return;
    if (this.data.isError) return;
    const mobile = this.data.mobile;
    if (this.checkMobile(mobile)) {
      this.setData({
        issubmit: true
      });
      c.post('member/bind/sendsms', { mobile }, (res) => {
        this.setData({
          issubmit: false
        });
        if (res.status === 1) {
          this.setData({
            code: MAX,
            issubmit: false,
            scode: res.result.message
          });
          this.countdown();
        }else {
          c.alert(res.result.message);
        }
      });
    } else {
      c.alert('请填写正确的手机号码格式');
    }
  },
  countdown() {
    let codeText = '';
    let count = this.data.code;
    const interval = setInterval(()=>{
      dothis.call(this);
    }, 1000);
    dothis.call(this);
    function dothis () {
      count--;
      app.setCache('code', count);
      if (count > 0) {
        codeText = '重新发送（' + count + '）';
      } else {
        codeText = '';
        clearInterval(interval);
      }
      this.setData({
        codeText,
        code: count
      });
    }
  },
  formsubmit(e) {
    const objvalue = e.detail.value;
    if (!this.WxValidate.checkForm(e)) {
      const error = this.WxValidate.errorList[0];
      c.alert(error.msg);
      return false;
    }
    if (this.data.scode.toString() !== objvalue.code) {
      c.alert('请输入正确的短信验证码!');
      return false;
    }
    this.setData({
      issubmit: true
    });
    c.post('member/bind/join', {
      mobile: objvalue.mobile,
      pwd: objvalue.password,
      rpwd:objvalue.repassword,
    }, (res)=>{
      this.setData({
        issubmit: false
      });
      if (res.status===1) {
        this.setData({
          issubmit: false
        });
        c.toast('注册成功');
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/member/login/login'
          })
        }, 1500);
      }else {
        c.alert(res.result.message);
      }
    });
  }
})