import * as React from "react";
import * as qs from "query-string";
import {Picker, List, WhiteSpace, DatePicker, TextareaItem, Button, Icon, Modal, Toast} from 'antd-mobile';
import * as styles from "./index.scss";
import * as moment from "moment";
import * as api from "../../../../services/abnormalLicense";
import {useState, useEffect} from "react";
interface IProps{
    data:any,
    methodType: any,
    onShowTipHandle: any,
    fetchData:any,
}
const alert = Modal.alert;
export default React.memo((props:IProps) => {
    const {methodType, onShowTipHandle} = props
    const params = qs.parse(window.location.search);
    const { msgid } = params;
    let list = [
        {
            label: '已通知供应商办理',
            value: 1,
        },
        {
            label: '证件办理中',
            value: 2,
        },
        {
            label: '已更新合格证件',
            value: 3,
        },
        {
            label: '即将撤场/撤柜',
            value: 4,
        },
        {
            label: '已停止合作无需更新',
            value: 5,
        },
    ]
    const titleConfig = {
        '30': '供应商资质证件还有30天过期，请及时办理更新。',
        '10':'供应商资质证件还有10天过期，请尽快办理更新。',
        '1':'供应商资质证件今日过期，请立即处理。',
        '-1': '供应商资质证件已过期，请立即处理。',
        '-10': '柜组营业执照状态异常，请及时更新',
    }

    const listToValue = (dataLabel) => {
        let value = 0;
        list.map((item) =>{
            if(item.label == dataLabel){
                value = item.value
            }
        })
        return value
    }

    const listToLabel = (dataValue) => {
        let label = '';
        list.map((item) =>{
            if(item.value == dataValue){
                label = item.label
            }
        })
        return label
    }

    const progresslistToValue = (dataLabel) => {
        let value = 0;
        progresslist.map((item) =>{
            if(item.label == dataLabel){
                value = item.value
            }
        })
        return value
    }

    const progresslistToLabel = (dataValue) => {
        let label = '';
        progresslist.map((item) =>{
            if(item.value == dataValue){
                label = item.label
            }
        })
        return label
    }

    if(methodType == 1 || methodType == -1) {
        list = [
            {
                label: '证件办理中',
                value: 2,
            },
            {
                label: '已更新合格证件',
                value: 3,
            },
            {
                label: '已停止合作无需更新',
                value: 5,
            },
            {
                label: '其他',
                value: 6,
            },
        ]
    }

    const progresslist = [
        {
            label: '已递交资料',
            value: 1,
        },
        {
            label: '已收到回执',
            value: 2,
        },
        {
            label: '已通过审批',
            value: 3,
        },
        {
            label: '其它',
            value: 4,
        },

    ]

    document.title = '证件异常预警推送';
    const {data} = props
    const [methodValue, setMethodValue] = useState(data.processDesc && [listToValue(data.processDesc)])
    const [progressValue, setProgressValue] = useState(data.processProgress && [progresslistToValue(data.processProgress)])
    const [dateValue, setDateValue] = useState(data.processDate && new Date(moment(data.processDate).format("YYYY-MM-DD HH:mm:ss")))
    const [textarea , setTextarea] = useState(data && data.specify)
    const [buttonDisabled, setButtonDisabled] =useState(true)
    const methodHandle = (value) => {
        setMethodValue(value)
    }
    const dateHandle = (value => {
        setDateValue(value)
    })
    const progressHandle = (value) => {
        setProgressValue(value)
    }
    const onTextareaChange = (value) => {
        setTextarea(value)
    }

    const onButtonClick = (data) => {
        const param = {
            expiredDate : data.expiredDate,
            idType: data.idType,
            msgid,
            processDate: moment(dateValue).format("YYYY-MM-DD"),
            processDesc: listToLabel(methodValue[0]),
            processProgress: progresslistToLabel(progressValue[0]),
            shoppeCode: data.shoppeCode,
            specify: textarea
        }
        return api.submitResult({...param},true).then((res: any) => {
            Toast.success('提交成功', 1);
            props.fetchData(msgid)
        })
    }
    useEffect(() => {
        if(methodValue[0] != 2){
            setProgressValue([])
        }
        if(methodValue[0] != 5){
            setDateValue(undefined)
        }
    }, [methodValue])

    useEffect(() => {
        if(methodValue[0] != 5 && methodValue[0] != 6 && progressValue[0] != 4){
            setTextarea('')
        }
    }, [methodValue,progressValue])

    useEffect(() => {
        if(
            ([1,3,4].includes(methodValue[0])) ||
            (methodValue[0] == 2 && [1,2,3].includes(progressValue[0])) ||
            (methodValue[0] == 2 && progressValue[0] == 4 && textarea.length > 0) ||
            (methodValue[0] == 5 && (dateValue || textarea.length > 0)) ||
            (methodValue[0] == 6 && textarea.length > 0)
        ){
            setButtonDisabled(false)

        }else{
            setButtonDisabled(true)
        }
    }, [methodValue, dateValue, progressValue, textarea])


    return   (
        <>
            <div className={`com-alitem ${styles.wrap}`}>
                <div className={styles.item}>
                    {/*{props.data}*/}
                    <div className={styles.title}>
                        {data.isDispose == 'N' && <span className={styles.tit_icon}></span>}
                        <span style={{color: data.pushTimesCnt >= 3 ? '#ff0000' : ''}}>{data.pushTimesCnt <3 ? titleConfig[methodType] : methodType == '-10'  ? '柜组营业执照状态异常，已重复预警超过3次' : methodType == '-1' ? '供应商资质证件已过期，超过3个月未更新证件' : titleConfig[methodType]}</span>
                        {(methodType == -1 || methodType == -10) && <Icon style={{ color: "#ccc",verticalAlign: '-2px',width: '16px',height: '16px',marginLeft: '5px' }} type="question-circle" onClick={onShowTipHandle} />}
                    </div>
                    <ul className={styles.textBox}>
                        {methodType != -10 ? (
                            <>
                                <li><span>供应商代码: </span><span>{data.supplierCode}</span></li>
                                <li><span>供应商简称: </span><span>{data.supplierName}</span></li>
                                <li><span>柜组编码: </span><span>{data.shoppeCode}</span></li>
                                <li><span>柜组简称: </span><span>{data.shoppeName}</span></li>
                                <li><span>证件名称: </span><span>{data.idName}</span></li>
                                <li><span>到期日期: </span><span>{moment(data.expiredDate/1000).format("YYYY/MM/DD")}</span></li>
                            </>
                        ) : (
                            <>
                                <li><span>经营小类: </span><span>{data.productCategory3}</span></li>
                                <li><span>柜组编码: </span><span>{data.shoppeCode}</span></li>
                                <li><span>柜组名称: </span><span>{data.shoppeName}</span></li>
                            </>
                        ) }

                        {(data.isDispose == 'Y' && methodType != -10) && <div className={styles.processed}></div>}
                    </ul>

                    {methodType != -10 &&
                    <List className={styles.picker}>

                      <Picker extra="请选择"
                              data={list}
                              cols={1}
                              value={methodValue}
                              onChange={methodHandle}
                              disabled={data.isDispose == 'Y'}
                      >
                        <List.Item arrow="horizontal" className={methodValue[0] ? 'picked' : ''}>处理方式</List.Item>
                      </Picker>


                        {methodValue[0] == 2 && <Picker extra="请选择"
                                                        data={progresslist}
                                                        cols={1}
                                                        value={progressValue}
                                                        onChange={progressHandle}
                                                        disabled={data.isDispose == 'Y'}
                        >
                          <List.Item arrow="horizontal" className={progressValue[0] ? 'picked' : ''}>证件办理程度</List.Item>
                        </Picker>}

                        {methodValue[0] == 5 && <DatePicker
                          mode="date"
                          extra="请选择"
                          title={'日期'}
                          value={dateValue}
                          minDate={new Date(moment().add(-30, 'days').format("YYYY/MM/DD"))}
                          maxDate={new Date(moment().format("YYYY/MM/DD"))}
                          onChange={dateHandle}
                          disabled={data.isDispose == 'Y'}
                        >
                          <List.Item arrow="horizontal" className={dateValue ? 'picked' : ''}>时间</List.Item>
                        </DatePicker>}

                    </List>
                    }
                    { methodType != -10 && (progressValue[0] == 4 || methodValue[0] == 5 || methodValue[0] == 6) && <div>
                        <div className={styles.Textarea_tit}>说明</div>

                        <TextareaItem
                            value={textarea}
                            className={styles.Textarea}
                            placeholder={methodValue[0] == 6 ? "请输入处理方式" : progressValue[0] == 4 ? "请输入具体说明" : methodValue[0] == 5 ? "如果柜组撤场/撤柜时间不在上方时间选择范围内，请手动输入撤场/撤柜时间，格式XXXX-XX-XX。" : ""}
                            rows={2}
                            count={15}
                            onChange={onTextareaChange}
                            disabled={data.isDispose == 'Y'}
                        />
                    </div>}

                    {
                        methodType != -10 && data.isDispose == 'N' &&
                        <div className={styles.button_wrap}>
                            {methodValue[0] == 5 ? (
                                <Button
                                    className={`${styles.button}  ${buttonDisabled ? 'disabled' : ''}`}
                                    type="primary"
                                    disabled={buttonDisabled}
                                    onClick={() =>
                                        alert('', '系统识别为有效柜组，请确认处理方式选择无误，提交后无法修改', [
                                            { text: '取消', onPress: () => console.log('cancel') },
                                            {
                                                text: '确定',
                                                onPress: () => onButtonClick(data)
                                                // new Promise((resolve) => {
                                                //     onButtonClick(data)
                                                //     Toast.info('onPress Promise', 1);
                                                //     setTimeout(resolve, 1000);
                                                // }),
                                            },
                                        ])
                                    }
                                >
                                    提交
                                </Button>
                            ): (
                                <Button
                                    className={`${styles.button}  ${buttonDisabled ? 'disabled' : ''}`}
                                    type="primary"
                                    disabled={buttonDisabled}
                                    onClick={() => onButtonClick(data)}
                                >
                                    提交
                                </Button>
                            )}
                        </div>
                    }

                </div>
            </div>
        </>
    )

})