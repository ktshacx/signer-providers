import './geeTestCode';
import { utils } from '@waves.exchange/provider-ui-components';
import { Bus, WindowAdapter, WindowProtocol } from '@waves/waves-browser-bus';

const w = window as any;
const { isBrave, isSafari } = utils;

const fetchFromNewWindow = (url: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const win = w.open(
            // location.origin + '/packages/provider-cloud-ui/index.html'
            'https://wallet-stage2.waves.exchange/signer-cloud'
        ); // todo url

        if (!win) {
            throw new Error('Window was blocked');
        }

        const adapter = new WindowAdapter(
            [new WindowProtocol(window, WindowProtocol.PROTOCOL_TYPES.LISTEN)],
            []
        );
        const bus = new Bus(adapter);

        bus.once('ready', () => {
            console.warn('first ready', window['__loginWindow']);

            window['__loginWindow'].addEventListener('unload', () => {
                reject('Window was closed by user');
            });

            const requestAdapter = new WindowAdapter(
                [new WindowProtocol(win, WindowProtocol.PROTOCOL_TYPES.LISTEN)],
                [
                    new WindowProtocol(
                        window,
                        WindowProtocol.PROTOCOL_TYPES.DISPATCH
                    ),
                ]
            );
            const requestBus = new Bus(requestAdapter);

            requestBus
                .request('fetchData', url, -1)
                .then((data) => {
                    console.warn('window get data', data);
                    resolve(data);
                    // win.close();
                })
                .catch((e) => {
                    console.warn('window get data catch error', e);
                    reject(e);
                    // win.close();
                });
        });
    });
};

export const getGeeTestToken = (
    geetestUrl: string
): Promise<{
    geetest_challenge: string;
    geetest_seccode: string;
    geetest_validate: string;
}> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (res, rej) => {
        try {
            // const response = await fetch(geetestUrl, {
            //     credentials: 'include',
            // });
            let data;

            if (w !== w.top && !w.opener && (isBrave() || isSafari())) {
                // todo safari conditions
                data = await fetchFromNewWindow(geetestUrl);
            } else {
                const response = await fetch(geetestUrl, {
                    credentials: 'include',
                });

                data = await response.json();

                if (!response.ok) {
                    rej(data);
                }
            }
            console.warn('data', data);

            if (!w.initGeetest) {
                return rej();
            }

            w.initGeetest(
                {
                    gt: data.gt,
                    lang: 'en',
                    hideSuccess: true,
                    hideClose: false,
                    challenge: data.challenge,
                    offline: !data.success,
                    new_captcha: true,
                    product: 'bind',
                    onError: rej,
                },
                function (geeTestObj: any) {
                    if (!geeTestObj) {
                        return rej();
                    }
                    geeTestObj.appendTo('body');
                    geeTestObj.onReady(() => geeTestObj.verify());
                    geeTestObj.onSuccess(() => res(geeTestObj.getValidate()));
                    geeTestObj.onError(rej);
                    geeTestObj.onClose(rej);
                },
                rej
            );
        } catch (e) {
            rej(e);
        }
    });
};
