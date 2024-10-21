import {ColumnProps} from "./types";
import {Component} from "react";
import {createScript, filterObjectKeys} from "../../lib/helpers";
import {Spin} from "antd";
import {ModalContext, ModalContextProps} from "../ModalContext";
import uniqueId from "lodash/uniqueId";

declare global {
    interface Window {
        UE: any,
        UE_LOADING_PROMISE: Promise<any>,
    }
}

export default class Ueditor extends Component<ColumnProps & {
    fieldProps: {
        ueditorPath: string,
    }
}, any> {
    modalContext = {} as ModalContextProps

    editor: any = null
    catching = false
    containerRef: HTMLElement | null = null
    state = {
        loading: true,
        containerId: uniqueId('ueditor_'),
        width: '',
    }


    componentDidMount() {
        this.setState({
            width: this.containerRef?.offsetWidth ? `${this.containerRef?.offsetWidth}px` : '100%'
        })

        this.props.rules?.push({
            validator: async (rule: any, value: any) => {
                if (this.catching) {
                    throw new Error('正在抓取图片')
                }
                return true
            },
        })

        if (!window.UE && !window.UE_LOADING_PROMISE) {
            window.UE_LOADING_PROMISE =
                createScript(this.props.fieldProps.configJsPath || this.props.fieldProps.ueditorPath + '/ueditor.config.js')
                    .then(() => {
                        return createScript(this.props.fieldProps.ueditorPath + '/ueditor.all.js')
                    })
                    .then(() => {
                        return createScript(this.props.fieldProps.ueditorPath + '/lang/zh-cn/zh-cn.js')
                    })
        }

        window.UE_LOADING_PROMISE.then(() => {
            let that = this
            window.UE.plugins['forceCatchRemoteImg'] = function () {
                if (this.options.forcecatchremote) {
                    this.addListener("afterpaste", function (t: any, a: any) {
                        const load_src = that.props.fieldProps.ueditorPath + '/img/load.gif';
                        const domUtils = window.UE.dom.domUtils;

                        const parser = new DOMParser();
                        const pasteDom = parser.parseFromString(a.html, "text/html");

                        // @ts-ignore
                        const allImgs = domUtils.getElementsByTagName(this.document, "img");
                        const imgs = domUtils.getElementsByTagName(pasteDom, "img");

                        let notCatch = (src: string) => {
                            if (src.indexOf(location.host) !== -1) {
                                return true;
                            }
                            if (/(^\.)|(^\/)/.test(src)) {
                                return true;
                            }
                            return src.indexOf('img_catch_success') !== -1;

                        }

                        let catchGo = false;
                        for (let i = 0; i < imgs.length; i++) {
                            if (notCatch(imgs[i].src)) {
                                continue
                            }
                            for (let l = 0; l < allImgs.length; l++) {
                                if (allImgs[l].src == imgs[i].src) {
                                    catchGo = true;
                                    domUtils.setAttributes(allImgs[l], {
                                        "src": load_src,
                                        "_src": allImgs[l].src
                                    });
                                }
                            }
                        }

                        if (catchGo) {
                            //     $('.submit').trigger('startHandlePostData', '正在抓取图片');
                            that.catching = true
                            that.props.dataIndex && that.props.form?.validateFields([that.props.dataIndex])
                        }
                    });

                    this.addListener("catchremotesuccess", function () {
                        that.catching = false
                        that.props.dataIndex && that.props.form?.validateFields([that.props.dataIndex])
                        //     $('.submit').trigger('endHandlePostData');
                    });
                }

            }

            // plugins/insert_richtext.js
            /**
             * 抓取微信富文本
             */
            window.UE.plugin.register('insert_richtext', function () {
                // @ts-ignore
                const me = this;

                function filter(div: HTMLElement) {
                    const domUtils = window.UE.dom.domUtils;
                    const browser = window.UE.browser;
                    const utils = window.UE.utils;

                    let html;
                    let ci;
                    if (div.firstChild) {
                        //去掉cut中添加的边界值
                        const nodes = domUtils.getElementsByTagName(div, 'span');
                        for (let i = 0, ni; ni = nodes[i++];) {
                            if (ni.id == '_baidu_cut_start' || ni.id == '_baidu_cut_end') {
                                domUtils.remove(ni);
                            }
                        }

                        if (browser.webkit) {

                            let brs = div.querySelectorAll('div br');
                            for (let i = 0, bi; bi = brs[i++];) {
                                const pN = bi.parentNode as HTMLElement;
                                if (pN) {
                                    if (pN.tagName == 'DIV' && pN.childNodes.length == 1) {
                                        pN.innerHTML = '<p><br/></p>';
                                        domUtils.remove(pN);
                                    }
                                }
                            }
                            const divs = div.querySelectorAll('#baidu_pastebin');
                            for (let i = 0, di; di = divs[i++];) {
                                const tmpP = me.document.createElement('p');
                                di.parentNode?.insertBefore(tmpP, di);
                                while (di.firstChild) {
                                    tmpP.appendChild(di.firstChild);
                                }
                                domUtils.remove(di);
                            }

                            const metas = div.querySelectorAll('meta');
                            for (let i = 0, ci; ci = metas[i++];) {
                                domUtils.remove(ci);
                            }

                            brs = div.querySelectorAll('br');
                            for (let i = 0; ci = brs[i++];) {
                                if (/^apple-/i.test(ci.className)) {
                                    domUtils.remove(ci);
                                }
                            }
                        }
                        if (browser.gecko) {
                            const dirtyNodes = div.querySelectorAll('[_moz_dirty]');
                            for (let i = 0; ci = dirtyNodes[i++];) {
                                ci.removeAttribute('_moz_dirty');
                            }
                        }
                        if (!browser.ie) {
                            const spans = div.querySelectorAll('span.Apple-style-span');
                            for (let i = 0, ci; ci = spans[i++];) {
                                domUtils.remove(ci, true);
                            }
                        }

                        //ie下使用innerHTML会产生多余的\r\n字符，也会产生&nbsp;这里过滤掉
                        html = div.innerHTML;//.replace(/>(?:(\s|&nbsp;)*?)</g,'><');

                        //过滤word粘贴过来的冗余属性
                        html = window.UE.filterWord(html);
                        //取消了忽略空白的第二个参数，粘贴过来的有些是有空白的，会被套上相关的标签
                        var root = window.UE.htmlparser(html);

                        //如果给了过滤规则就先进行过滤
                        if (me.options.filterRules) {
                            window.UE.filterNode(root, me.options.filterRules);
                        }
                        //执行默认的处理
                        me.filterInputRule(root);
                        //针对chrome的处理
                        if (browser.webkit) {
                            var br = root.lastChild();
                            if (br && br.type == 'element' && br.tagName == 'br') {
                                root.removeChild(br)
                            }
                            utils.each(me.body.querySelectorAll('div'), function (node: HTMLElement) {
                                if (domUtils.isEmptyBlock(node)) {
                                    domUtils.remove(node, true)
                                }
                            })
                        }
                        html = {'html': root.toHtml()};
                        me.fireEvent('beforepaste', html, root);
                        //抢了默认的粘贴，那后边的内容就不执行了，比如表格粘贴
                        if (!html.html) {
                            return;
                        }
                        root = window.UE.htmlparser(html.html, true);
                        //如果开启了纯文本模式
                        if (me.queryCommandState('pasteplain') === 1) {
                            me.execCommand('insertHtml', window.UE.filterNode(root, me.options.filterTxtRules).toHtml(), true);
                        } else {
                            //文本模式
                            window.UE.filterNode(root, me.options.filterTxtRules);
                            const txtContent = root.toHtml();
                            //完全模式
                            const htmlContent = html.html;

                            const address = me.selection.getRange().createAddress(true);
                            // @ts-ignore
                            me.execCommand('insertHtml', me.getOpt('retainOnlyLabelPasted') === true ? getPureHtml(htmlContent) : htmlContent, true);
                        }

                        me.fireEvent("afterpaste", html);
                    }
                }


                return {
                    bindEvents: {
                        'afterInsertRichText': function (e: Event, html: HTMLElement) {
                            me.execCommand('cleardoc');
                            filter.call(me, html);
                            me.document.body.innerHTML = `<section>${html}</section>`;

                            me.fireEvent('catchremoteimage');

                            that.catching = true
                            that.props.dataIndex && that.props.form?.validateFields([that.props.dataIndex])
                            // $('.submit').trigger('startHandlePostData', '正在抓取图片');
                        },
                    },
                    commands: {}
                }
            });


            const config = {
                ...this.props.fieldProps?.config,
                forcecatchremote: typeof this.props.fieldProps?.config?.forcecatchremote === 'undefined' ? true : this.props.fieldProps.config.forcecatchremote,
            }
            if (this.modalContext?.inModal) {
                config.zIndex = 2000
                config.topOffset = 0
            }

            this.editor = window.UE.getEditor(this.state.containerId, config)
            this.editor?.ready(() => {
                this.editor?.addListener('contentChange', () => {
                    this.props.form?.setFieldValue(this.props.dataIndex, this.editor?.getContent())
                })
                this.setState({loading: false})
            })
        })

    }

    componentWillUnmount() {
        this.editor?.destroy()
    }

    render() {
        return <ModalContext.Consumer>
            {
                modalContext => {
                    this.modalContext = modalContext
                    return <div {...filterObjectKeys(this.props, [
                        'id',
                        'fieldProps',
                        'onChange',
                        'value',
                        'form',
                        'config',
                        'rules',
                        'ueditorPath',
                        'dataIndex',
                    ])} ref={el => this.containerRef = el}>
                        <Spin spinning={this.state.loading}>
                            <div id={this.state.containerId} style={{width: this.state.width}}/>
                        </Spin>
                    </div>
                }
            }
        </ModalContext.Consumer>
    }
}