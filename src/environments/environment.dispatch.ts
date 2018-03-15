import {NgxChartsModule} from '@swimlane/ngx-charts';

export const environment = {
    name: 'dispatch',
    production: false,
    dispatchNodeIp: 'localhost',
    m2AppName: 'Dispatch',
    m2AppId: '',
    m2AppVersion: '',
    m2Url: '',
    m2SessionTimeToLive: 20,
    m2SpinnerUrl: '',
    m2SpinnerWidth: 40,
    m2ButtonMinWidth: '180px',
    m2WebsiteUrl: '',
    m2WebProxyPort: 3001,
    m2InfoUrl: '',
    m2ConfirmUrl: '',
    m2PostListImageUrl: '',
    browserModulesOnly: [NgxChartsModule]
};