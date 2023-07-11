import * as React from "react";
import * as qs from "query-string";
import {
    Tabs,
    Badge,
    Button,
    Flex,
    Modal,
    ImagePicker,
} from "antd-mobile";
import * as styles from "./index.scss";
import ALItem from './components/ALItem'
import * as api from "../../services/abnormalLicense";
import * as moment from "moment";

const { useState, useEffect, useCallback } = React;

export default React.memo(() => {
    document.title = '证件异常预警';
    const params = qs.parse(window.location.search);
    const { msgid } = params;
    const [tabIndex, setTabIindex] = useState(0);
    const [isShowTips, setIsShowTips] = useState(false);
    const [badgeNum, setBadgeNum] = useState({undisposedCnt30Day:0, undisposedCnt10Day: 0,undisposedCntToday: 0,undisposedCntExpired: 0,undisposedCntLicense:0})
    const [list,setList] = useState({certificateList30Day: [],certificateList10Day: [],certificateListToday: [],certificateListExpired: [],certificateListLicense: []})
    const tabs = [
        { title: <Badge text={badgeNum.undisposedCnt30Day}>30天</Badge> },
        { title: <Badge text={badgeNum.undisposedCnt10Day}>10天</Badge> },
        { title: <Badge text={badgeNum.undisposedCntToday}>当天</Badge> },
        { title: <Badge text={badgeNum.undisposedCntExpired}>已过期</Badge> },
        { title: <Badge text={badgeNum.undisposedCntLicense}>营业执照异常</Badge> },
    ];

    const fetchData = (msgid) => {
        api.getCertificateWarn({ msgid }, true).then((res: any) => {
            if (res) {
                let {undisposedCnt30Day,undisposedCnt10Day,undisposedCntToday,undisposedCntExpired,undisposedCntLicense,
                    certificateList30Day=[],certificateList10Day=[], certificateListToday=[] ,certificateListExpired=[],certificateListLicense=[]} = res;

                setBadgeNum({undisposedCnt30Day, undisposedCnt10Day, undisposedCntToday,undisposedCntExpired,undisposedCntLicense});
                certificateList30Day = dataFormat(certificateList30Day);
                certificateList10Day = dataFormat(certificateList10Day);
                certificateListToday = dataFormat(certificateListToday);
                certificateListExpired = dataFormat(certificateListExpired);
                certificateListLicense = dataFormat(certificateListLicense);

                setList({certificateList30Day,certificateList10Day, certificateListToday ,certificateListExpired,certificateListLicense})
            }
        });
    };

    const dataFormat = (list) => {
        const list1 = [];
        const list2 = [];
        list.map((item,index) => {
            if(item.isDispose == 'Y'){
                list2.push(item)
            }else{
                list1.push(item)
            }
        })
        return [...list1, ...list2]
    }

    const submitResult = () => {
        const pList = [];
        list.certificateListLicense.map((data) => {
            if(data.isDispose == 'N'){
                const param = {
                    expiredDate : data.expiredDate,
                    idType: data.idType,
                    msgid,
                    shoppeCode: data.shoppeCode,
                }
                pList.push(api.submitResult({...param},true))
            }
        })
        if(pList.length){
            const p = Promise.all([...pList])
            p.then(()=>{
                fetchData(msgid)
            })
        }
    }

    useEffect(() => {
        // const msgid = '545c84bb-416a-4a9f-8d25-37b4936c9b6d';
        fetchData(msgid)
    }, [])

    const onChange =  (tab, index) => {
        setTabIindex(index);
        if(index == 4) {
            submitResult()
        }
        // document.getElementsByClassName('am-tabs-content-wrap').scrollTo({})
    };
    const showTipHandle = () => {
        setIsShowTips(true)
    }

    return (
        <div className={`p-abnormal-license tabIndex${tabIndex}`}>
            <Tabs tabs={tabs} initialPage={0} useOnPan={false} swipeable={false} onChange={onChange}>
                <div>
                    {list.certificateList30Day.map((item) =>
                        <ALItem key={`${item.shoppeCode}_${item.expiredDate}_${item.idType}_${item.dataType}`} data={item} methodType={30} onShowTipHandle={showTipHandle} fetchData={fetchData}/>
                    )}
                    {
                        !list.certificateList30Day.length &&
                            <div className={styles.no_data}>暂无数据</div>
                    }
                </div>
                <div>
                    {list.certificateList10Day.map((item) =>
                        <ALItem key={`${item.shoppeCode}_${item.expiredDate}_${item.idType}_${item.dataType}`} data={item} methodType={10} onShowTipHandle={showTipHandle} fetchData={fetchData}/>
                    )}
                    {
                        !list.certificateList10Day.length &&
                        <div className={styles.no_data}>暂无数据</div>
                    }
                </div>
                <div>
                    {list.certificateListToday.map((item) =>
                        <ALItem key={`${item.shoppeCode}_${item.expiredDate}_${item.idType}_${item.dataType}`} data={item} methodType={1} onShowTipHandle={showTipHandle} fetchData={fetchData}/>
                    )}
                    {
                        !list.certificateListToday.length &&
                        <div className={styles.no_data}>暂无数据</div>
                    }
                </div>
                <div>
                    {list.certificateListExpired.map((item) =>
                        <ALItem key={`${item.shoppeCode}_${item.expiredDate}_${item.idType}_${item.dataType}`} data={item} methodType={-1} onShowTipHandle={showTipHandle} fetchData={fetchData}/>
                    )}
                    {
                        !list.certificateListExpired.length &&
                        <div className={styles.no_data}>暂无数据</div>
                    }
                </div>
                <div>
                    {list.certificateListLicense.map((item) =>
                        <ALItem key={`${item.shoppeCode}_${item.expiredDate}_${item.idType}_${item.dataType}`} data={item} methodType={-10} onShowTipHandle={showTipHandle} fetchData={fetchData}/>
                    )}
                    {
                        !list.certificateListLicense.length &&
                        <div className={styles.no_data}>暂无数据</div>
                    }
                </div>
            </Tabs>

            <Modal
                className={styles.tipsModal}
                visible={isShowTips}
                transparent
                title="提示说明"
                footer={[
                    {
                        text: "我知道了",
                        onPress: () => {
                            setIsShowTips(false);
                        },
                    },
                ]}
            >
                <div>
                    {tabIndex == 3 ? (
                        <div className={styles.tips}>
                            <div>回复预警后请于次月1日前在系统更新证件（除已撤场/撤柜柜组），否则次月1日将重复收到预警推送；如果无法于次月1日前更新，务必先回复当前预警，再回复次月1日预警并在1个月内更新证件。首次收到预警后90天内未在系统更新证件或超过3次未回复预警，预警同步推送直属领导。</div>
                        </div>
                    ) :
                        tabIndex == 4 ?
                            (
                        <div className={styles.tips}>
                            <div>
                                收到预警后请于次月1日前在系统更新证件，否则次月1日将重复收到预警推送；首次收到预警后90天内未在系统更新证件，预警同步推送直属领导。
                            </div>
                        </div>
                    ): ''}
                </div>
            </Modal>
        </div>
    )
})