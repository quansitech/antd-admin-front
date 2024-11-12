import fs from "node:fs"
import path from "node:path"
import * as process from "node:process";

export default function () {
    // 分析额外组件
    if (!fs.existsSync(process.cwd() + '/vendor')) {
        throw new Error('Please run `composer install` first.');
    }

    const installed = JSON.parse(fs.readFileSync(process.cwd() + '/vendor/composer/installed.json').toString())
    const extras = installed.packages.filter(p => !!p.extra?.qscmf?.['antd-admin']).map(p => ({
        name: p.name,
        path: p['install-path'],
        component: p.extra.qscmf['antd-admin'].component,
    }));

    const extra_script = `
import {container} from "@quansitech/antd-admin";

${extras.map(e => {
        const cs = [];
        for (const componentKey in e.component) {
            cs.push(`container.register('${componentKey}', ()=>import('../../../vendor${path.join('/', e.path, e.component[componentKey])}'));`)
        }
        return cs.join('\n');
    })}
`

    fs.writeFileSync(process.cwd() + '/resources/js/backend/extra.ts', extra_script);
}