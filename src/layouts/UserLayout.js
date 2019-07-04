import React, { Component, Fragment } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import Link from 'umi/link';
import { Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';
import DocumentTitle from 'react-document-title';
import SelectLang from '@/components/SelectLang';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';
import getPageTitle from '@/utils/getPageTitle';

const links = [
  {
    key: 'help',
    title: formatMessage({ id: 'layout.user.link.help' }),
    href: '',
  },
  {
    key: 'privacy',
    title: formatMessage({ id: 'layout.user.link.privacy' }),
    href: '',
  },
  {
    key: 'terms',
    title: formatMessage({ id: 'layout.user.link.terms' }),
    href: '',
  },
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 2019 精诚（中国）企业管理有限公司
  </Fragment>
);

class UserLayout extends Component {
  componentDidMount() {
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;
    // dispatch({
    //   type: 'menu/getMenuData',
    //   payload: { routes, authority },
    // });
  }

  render() {
    const {
      children,
      location: { pathname },
      breadcrumbNameMap,
    } = this.props;
    console.log('llll', localStorage.getItem('loginLogoImg'))
    const loginLogo =
      localStorage.getItem('loginLogoImg') && localStorage.getItem('loginLogoImg') !== 'undefined'
        ? JSON.parse(localStorage.getItem('loginLogoImg'))
        : [];
    return (
      <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
        <div className={styles.container}>
          {/* <div className={styles.lang}>
            <SelectLang />
          </div> */}
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.header}>
                {/* <Link to="/"> */}
                {/* <img alt="logo" className={styles.logo} src="./logo.png" />
                <span className={styles.title}>精诚供应链系统</span> */}
                <img
                  alt="logo"
                  className={styles.logo}
                  src={loginLogo.length > 0 ? loginLogo[0].url : ''}
                />
                <span className={styles.title}>
                  {localStorage.getItem('loginMainTitle') && localStorage.getItem('loginMainTitle') !== 'undefined'
                    ? localStorage.getItem('loginMainTitle')
                    : ''}
                </span>
                {/* </Link> */}
              </div>
              {/* <div className={styles.desc}>上海市最具影响力的 Web 设计规范</div> */}
              <div style={{ height: '4rem' }} />
            </div>
            {children}
          </div>
          <GlobalFooter links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({ menu: menuModel }) => ({
  menuData: menuModel.menuData,
  breadcrumbNameMap: menuModel.breadcrumbNameMap,
}))(UserLayout);
