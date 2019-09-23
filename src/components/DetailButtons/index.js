import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'dva';
import moment from 'moment';
import _ from 'lodash';
import router from 'umi/router'
import { Form, Row, Col, Select, Input, Button, Icon, DatePicker } from 'antd';
import ComModal from '@/components/ConfirmModel/index';
import FormModals from '@/components/ConfirmModel/FormModal';
import GuidePage from '@/components/GuidePage/NewIndex';
import ButtonGroup from '@/components/ButtonGroup';
import DetailButtonGroup from '@/components/DetailButtonsGroup';

import styles from './style.less';

let editAndDeleteButton = {
  ADD: {},
  DELETE: {},
  EDIT: {},
  OPENACCOUNT: {}, //开户
};

@Form.create()
@connect(({ tableTemplate, loading, guidePage }) => ({
  tableTemplate,
  guidePage,
  loading: loading.effects['tableTemplate/getDetailSave'],
}))
class DetailButtons extends PureComponent {
  state = {};
  
  componentWillReceiveProps=(newProps)=>{
    if(newProps.tableTemplate.isNewSave != this.props.tableTemplate.isNewSave){
      if(this.props.detailForm){
        this.props.detailForm.resetFields()
      }
    }
  }

  handleClickItem = item => { };

  //详情页按钮，按钮组版本
  editButton = () => {
    const buttons = _.get(this.props.tableTemplate, 'detailData.buttons', []);
    const buttonData = [];
    // 删除，编辑区分处理
    editAndDeleteButton = {};
    const buttonList = [];

    buttons.map(item => {

      if (item.FIELD_NAME === 'DELETE') {
        editAndDeleteButton['DELETE'] = item;
      } else if (item.FIELD_NAME === 'EDIT') {
        editAndDeleteButton['EDIT'] = item;
      } else if (item.FIELD_NAME === 'ADD') {
        editAndDeleteButton['ADD'] = item;
      } else {
        if (!item.DISPLAY_CONDITION) {
          return
        }
        // buttonData.push(item);
        const index = _.findIndex(buttonList, l => l.groupName === item.BUTTON_GROUP);
        if (index > -1) {
          buttonList[index].buttons.push(item);
        } else {
          buttonList.push({ groupName: item.BUTTON_GROUP, buttons: [item] });
        }
      }
    });
    if (buttonList.length === 0) {
      return null;
    }
    return (
      <span>
        <DetailButtonGroup buttonList={buttonList} />
      </span>
    );
  };

  // 判断是否做了修改
  checkChanged = () => {
    if(this.props.detailForm){
      const { tableTemplate } = this.props;
      const {
        DetailChildData,
        initPolicyFormFields,
        initDetailChildData,
        isChildAdd,
      } = tableTemplate;
      const { policyFormFields = [] } = _.get(tableTemplate, 'detailData');
      let hasChanged = false;
      const fieldValues = this.props.detailForm.getFieldsValue();
      _.map(initPolicyFormFields, field => {
        if (field.FIELD_VALUE != fieldValues[field.FIELD_NAME]) {
          hasChanged = true;
        }
      });
      _.map(DetailChildData.child, (data, index) => {
        const initChild = initDetailChildData.child[index];
        if (data.fieldGroupName == initChild.fieldGroupName) {
          if (data.records.length !== initChild.records.length) {
            hasChanged = true;
          } else {
            if (data.records.length === 0) {
              return;
            }
            _.map(data.records, (record, idx) => {
              const initRecord = initChild.records[idx];
              _.map(record, (itm, ix) => {
                if (itm.FIELD_VALUE != initRecord[ix].FIELD_VALUE) {
                  hasChanged = true;
                }
              });
            });
          }
        }
      });

      if (hasChanged || isChildAdd) {
        this.showConfirmModal('onCancled', '确定要取消本次操作？');
      } else {
        this.handleOk('onCancled');
      }
      }
  };

  showConfirmModal = (e, message) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const ComModalProps = {
      handleOk: () => {
        this.handleOk(e);
      },
      message,
    };
    ReactDOM.render(<ComModal store={window.g_app._store} {...ComModalProps} />, div);
  };

  handleOk = e => {
    if (e === 'tableDelete') {
      this.tableDelete();
    } else if (e === 'detailDelete') {
      this.detailDelete();
    } else if (e === 'onCancled') {
      this.onCancled();
    }
  };

  // 开户
  openAccount = e => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const ComModalProps = {
      tableButton: e,
    };
    ReactDOM.render(<GuidePage store={window.g_app._store} {...ComModalProps} />, div);
  };

  // 新增
  detailCreate = () => {
    //新版
    let {pathname,search} = this.props.location
    let newPathName = pathname.split('/detail/')[0] + '/add' + search
    router.push(newPathName)
  };

  // 编辑
  detailEdit = () => {
    let {pathname,search} = this.props.location
    let newPathName = pathname.replace(/detailSee/g,'detail') + search
    router.push(newPathName)
  };

  // 删除
  detailDelete = () => {
    const businessId = this.props.tableTemplate.selectDate.ID;
    this.props.dispatch({
      type: 'tableTemplate/getRemoveBusiness',
      payload: { businessId },
      callback: res => {
        if (res.status === 'success') {
          this.props.dispatch({
            type: 'tableTemplate/changeState',
            payload: { isEdit: false },
          });
        }
      },
    });
  };

  // 返回
  editBack = () => {
    let {pathname,search} = this.props.location
    let type = pathname.includes('detailSee')
    if(type){
      let newPathName = pathname.split('/detailSee/')[0] + '/list' + search
      router.push(newPathName)
    } else {
      let newPathName = pathname.replace(/detail/g,'detailSee') + search
      router.push(newPathName)
    }
  };

  // 取消
  onCancled = () => {
    router.goBack()
  };

  // 保存
  onEditSave = value => {
    let {saveType} = this.props
    let {pathname,search} = this.props.location
    this.props.detailForm.validateFields((err, fieldValues) => {
      if (!err) {
        for(let i in fieldValues){
          if(typeof fieldValues[i] == 'object' && fieldValues[i] != null){
            fieldValues[i] = fieldValues[i].valueOf()
          }
        }
        if(saveType == 'edit'){
          this.props.dispatch({
            type: 'detailPage/getDetailEdit',
            payload: { value: fieldValues,pathname,search }
          });
        } else {
          this.props.dispatch({
            type: 'detailPage/getDetailSave',
            payload: { value: fieldValues,pathname,search }
          });
        }
      }
    });
  };

  //详情页的自定义按钮事件
  onButtonEvent = e => {
    const { isEdit } = this.props.tableTemplate;
    this.props.dispatch({
      type: 'tableTemplate/getTransactionProcess',
      payload: { Buttons: e, isEdit },
    });
    this.props.dispatch({
      type: 'tableTemplate/getDetailPage',
      payload: {
        ID: this.props.tableTemplate.selectDate.ID,
        ObjectType: this.props.tableTemplate.detailColumns.objectType,
        pageId: this.props.tableTemplate.pageId,
      },
    });
  };

  render() {
    const { tableColumns = [], isEdit, selectedRowKeys, buttonType } = this.props.tableTemplate;
    const tableButtons = this.props.tableTemplate.tableColumnsData.buttons || [];
    const { loading = false } = this.props;
    return (
      <div>
        <div
          className="BasicEditBody"
          style={{
            display: buttonType ? 'block' : 'none',
            background: 'white',
            lineHeight: '41px',
          }}
        >
          <Button
            disabled={
              editAndDeleteButton['ADD'] ? editAndDeleteButton['ADD'].READ_ONLY_CONDITION : false
            }
            style={{
              marginRight: '10px',
              display: !_.isEmpty(editAndDeleteButton['ADD'])
                ? editAndDeleteButton['ADD'].DISPLAY_CONDITION
                  ? 'inline-block'
                  : 'none'
                : 'inline-block',
            }}
            onClick={this.detailCreate}
            type="primary"
          >
            新增
          </Button>
          <Button
            disabled={
              editAndDeleteButton['EDIT'] ? editAndDeleteButton['EDIT'].READ_ONLY_CONDITION : false
            }
            style={{
              marginRight: '10px',
              display: !_.isEmpty(editAndDeleteButton['EDIT'])
                ? editAndDeleteButton['EDIT'].DISPLAY_CONDITION
                  ? 'inline-block'
                  : 'none'
                : 'inline-block',
            }}
            onClick={this.detailEdit}
          >
            编辑
          </Button>
          <Button
            disabled={
              editAndDeleteButton['DELETE']
                ? editAndDeleteButton['DELETE'].READ_ONLY_CONDITION
                : false
            }
            style={{
              marginRight: '10px',
              display: !_.isEmpty(editAndDeleteButton['DELETE'])
                ? editAndDeleteButton['DELETE'].DISPLAY_CONDITION
                  ? 'inline-block'
                  : 'none'
                : 'inline-block',
            }}
            onClick={() => this.showConfirmModal('detailDelete', '确定要删除这条数据么？')}
          >
            删除
          </Button>
          {/* 自定义按钮 */}
          {this.editButton()}
          <Button style={{ marginRight: '10px' }} onClick={this.editBack}>
            返回
          </Button>
        </div>
        <div
          className="BasicEditBody"
          style={{
            display: buttonType ? 'none' : 'block',
            background: 'white',
            lineHeight: '41px',
            // padding: '1rem',
          }}
        >
          <Button
            onClick={()=>this.onEditSave()}
            style={{ marginRight: '10px' }}
            type="primary"
            loading={loading}
          >
            保存
          </Button>
          <Button style={{ marginRight: '10px' }} onClick={this.checkChanged}>
            取消
          </Button>
        </div>
      </div>
    );
  }
}

export default DetailButtons;
