import React from 'react'
import { connect } from 'dva';
import { LocaleProvider,Steps, Button, DatePicker, InputNumber, message, Card, Modal, Form, Switch, Row, Col, Input, Select, Number, notification } from 'antd';
import moment from 'moment';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import _ from 'lodash';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const dateFormat = 'YYYY/MM/DD';
const { Item } = Form;
const formItemLayout = {
  labelCol: {
    xs: { span: 8 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 16 },
    sm: { span: 17 },
  },
};
let loopData

@Form.create()

export default class FormModular extends React.Component {
  state={ 
      showData:{}
  }

  componentWillMount=()=>{
    let params = this.props.tableButton.BUTTON_GUIDE[this.props.current]
    this.props.dispatch({
        type: 'guidePage/getGuideBean', payload: {
          params,
          pageNum: 1,
          pageSize: 10,
          METHOD_BODY: params.METHOD_BODY,
        },callback:res=>{
            if (res.status == 'success') {
                this.props.dispatch({type:'guidePage/detailButtonGuide',payload:{
                    OBJECT_TYPE:this.props.tableButton.BUTTON_GUIDE[this.props.current].OBJECT_TYPE,
                    RELATED_FIELD_GROUP:this.props.tableButton.BUTTON_GUIDE[this.props.current].RELATED_FIELD_GROUP,
                    id:this.props.tableTemplate.isEdit ? this.props.tableTemplate.detailData.thisComponentUid : null
                },callback:res=>{
                    this.setState({
                        showData:res
                    })
                }})
            }
        }
  })
}
  disabledStartDate = (e,value) => {
    const endValue = this.state[`${value.FIELD_NAME}-end`];
    if (!e || !endValue) {
      return false;
    }
    return e.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (e,value) => {
    const startValue = this.state[`${value.FIELD_NAME}-start`];
    if (!e || !startValue) {
      return false;
    }
    return e.valueOf() <= startValue.valueOf();
  };

  onDateChange = (field, value) => {
    this.setState({
      [field]: value,
    })
  };

  onStartChange = (e,value) => {
    this.onDateChange(`${value.FIELD_NAME}-start`, e);
  };

  onEndChange = (e,value) => {
    this.onDateChange(`${value.FIELD_NAME}-end`, e);
  };
  componentWillUnmount=()=>{
      this.props.dispatch({
          type:'guidePage/getSaveData',
          payload:{relatedFieldGroup:this.state.showData.relatedFieldGroup,data:this.props.form.getFieldsValue()}
      })
  }


  render() {
    const { getFieldDecorator } = this.props.form
    let cacheData = {}  //缓存数据
    let loopData = []  //分组数据
    let {showData} = this.state
    let forms = showData.policyFormFields
    if(forms){
        forms.map(item => {
        if (cacheData[item.PAGE_FIELD_GROUP_NAME]) {
                cacheData[item.PAGE_FIELD_GROUP_NAME].push(item)
            } else {
                cacheData[item.PAGE_FIELD_GROUP_NAME] = [item]
            }
        })
        for (let i in cacheData) {
            loopData.push(cacheData[i])
        }
    }
    return (
      <div>
        <LocaleProvider locale={zhCN}>
            <div>
            {
            loopData.map((item, jj) => {
              return <div key={jj}>
                <span style={{ paddingTop: '1rem', display: 'inline-block' }}>{item[0].PAGE_FIELD_GROUP_NAME}</span>
                <Card style={{ border: 'none', borderBottom: '1px solid #e8e8e8' }}>
                  {item.map((values, index) => {
                    switch (values.WIDGET_TYPE) {
                      case 'Text':
                        return (
                          <Col key={index} span={10} offset={1} key={values.SEQUENCE + values.NAME}>
                            <Form.Item
                              label={values.LABEL}
                              {...formItemLayout}
                              style={{ width: '100%' }}
                            >
                              {getFieldDecorator(`${values.FIELD_NAME}`, {
                                initialValue: cacheFormData ? cacheFormData[index].DISPLAY_NAME : values.DISPLAY_NAME,
                                rules: [
                                  {
                                    required: values.REQUIRED_CONDITION,
                                    message: `${values.LABEL}不能为空`,
                                  },
                                ]
                              })(
                                <Input
                                  style={{width:'100%'}}
                                  placeholder={`请录入${values.LABEL}`}
                                />
                              )}
                            </Form.Item>
                          </Col>
                        );
                        break;
                      case 'Select':
                      case 'Reference':
                      case 'ObjectSelector':
                        return (
                          <Col span={10} offset={1} key={values.SEQUENCE + values.NAME}>
                            <Item
                              label={values.LABEL}
                              style={{ width: '100%' }}
                              {...formItemLayout}
                            >
                              {getFieldDecorator(`${values.NAME}`, {
                                initialValue: values.FIELD_VALUE || null,
                                rules: [
                                  {
                                    required: values.REQUIRED_CONDITION,
                                    message: `${values.LABEL}不能为空`,
                                  },
                                ],
                              })(
                                <Select
                                  filterOption={false}
                                  placeholder={`请选择${values.LABEL}`}
                                  allowClear
                                  style={{width:'100%'}}
                                  showSearch={values.widgetType !== 'Select'}
                                  filterOption={(inputValue, option) =>
                                    _.includes(option.props.children, inputValue)
                                  }
                                >
                                  {_.map(values.options, (v, i) => {
                                    return (
                                      <Select.Option value={v.value} key={v.value}>
                                        {v.text}
                                      </Select.Option>
                                    );
                                  })}
                                </Select>
                              )}
                            </Item>
                          </Col>
                        );
                        break;
                      case 'Date':
                      case 'DateTime':
                        let Date = [
                          {
                            ...values,
                            LABEL: `起始${values.LABEL}`,
                            DateType: 'start',
                          },
                          {
                            ...values,
                            LABEL: `结束${values.LABEL}`,
                            FIELD_VALUE: null,
                            DateType: 'end',
                          }
                        ]
                        return Date.map((kk, gg) => {
                          let type = kk.DateType
                          switch (type) {
                            case 'start' :
                                return (
                                  <Col span={10} offset={1} key={kk.SEQUENCE + kk.NAME + gg}>
                                    <Form.Item
                                      label={kk.LABEL}
                                      style={{ width: '100%' }}
                                      {...formItemLayout}
                                    >
                                      {getFieldDecorator(`${values.FIELD_NAME}-${kk.DateType}`, {
                                        initialValue: null,
                                        rules: [
                                          {
                                            required: gg == 0 ? values.REQUIRED_CONDITION : false,
                                            message: `${kk.LABEL}不能为空`
                                          }
                                        ]
                                      })(
                                        <DatePicker
                                          placeholder={`请选择${kk.LABEL}`}
                                          format="YYYY-MM-DD"
                                          placeholder=''
                                          showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}
                                          style={{ width: '100%' }}
                                          disabledDate={(e)=>this.disabledStartDate(e,kk)}
                                        />
                                      )}
                                    </Form.Item>
                                  </Col>
                                );
                              break
                            case 'end' :
                              return (
                            <Col span={10} offset={1} key={kk.SEQUENCE + kk.NAME + gg}>
                              <Form.Item
                                label={kk.LABEL}
                                style={{ width: '100%' }}
                                {...formItemLayout}
                              >
                                {getFieldDecorator(`${values.FIELD_NAME}-${kk.DateType}`, {
                                  initialValue: null,
                                  rules: [
                                    {
                                      required: gg == 0 ? values.REQUIRED_CONDITION : false,
                                      message: `${kk.LABEL}不能为空`
                                    }
                                  ]
                                })(
                                  <DatePicker
                                    placeholder={`请选择${kk.LABEL}`}
                                    format="YYYY-MM-DD"
                                    placeholder=''
                                    showTime={{defaultValue: moment('23:59:59', 'HH:mm:ss')}}
                                    style={{ width: '100%' }}
                                    disabledDate={(e)=>this.disabledEndDate(e,kk)}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          );
                              break
                            default :
                              break
                          }
                        })
                        break;
                      case 'Number':
                        return (
                          <Col span={10} offset={1} key={values.SEQUENCE + values.NAME}>
                            <Form.Item
                              label={values.LABEL}
                              style={{ width: '100%' }}
                              {...formItemLayout}
                            >
                              {getFieldDecorator(`${values.DISPLAY_NAME}`, {
                                initialValue: cacheFormData ? cacheFormData[index].DISPLAY_NAME : values.DISPLAY_NAME,
                                rules: [
                                  {
                                    required: values.REQUIRED_CONDITION,
                                    message: `${values.LABEL}不能为空`,
                                  },
                                ],
                              })(
                                <InputNumber
                                  onBlur={this.onInputBlur}
                                  style={{ width: '100%' }}
                                  placeholder={`请录入${values.LABEL}`}
                                />)}
                            </Form.Item>
                          </Col>
                        );
                      case 'Textarea':
                        return (
                          <Col span={10} offset={1} key={values.SEQUENCE + values.NAME}>
                            <Form.Item
                              label={values.LABEL}
                              style={{ width: '100%' }}
                              {...formItemLayout}
                            >
                              <div>
                                <TextArea
                                  rows={3}
                                  style={{ width: '100%' }}
                                  placeholder={`请录入${values.LABEL}`}
                                  defaultValue={cacheFormData ? cacheFormData[index].DISPLAY_NAME : values.DISPLAY_NAME}
                                />
                              </div>
                            </Form.Item>
                          </Col>
                        );
                      default:
                        break;
                    }
                  })}
                </Card>
              </div>
            })
          }
            </div>
        </LocaleProvider>
      </div>
    )
  }
}