import {Cascader as AntCascader} from 'antd';
import React from 'react';
import TestRenderer, {act} from 'react-test-renderer';
import Cascader from '../components/Column/Cascader';

jest.mock('antd', () => ({
    Cascader: () => null,
}));

test('clearing a Cascader passes only the cleared value to fieldProps.onChange', async () => {
    const calls = [];
    let renderer;

    await act(async () => {
        renderer = TestRenderer.create(
            <Cascader
                fieldProps={{
                    'data-field': 'area_id',
                    onChange: (...args) => calls.push(args),
                    options: [{label: '河北省', value: 130000}],
                    value: 130000,
                }}
            />,
        );
    });

    const cascader = renderer.root.findByType(AntCascader);
    await act(async () => {
        cascader.props.onChange([]);
    });

    expect(calls).toEqual([[undefined]]);

    await act(async () => {
        renderer.unmount();
    });
});

test('clearing a multiple Cascader passes an empty array to fieldProps.onChange', async () => {
    const calls = [];
    let renderer;

    await act(async () => {
        renderer = TestRenderer.create(
            <Cascader
                fieldProps={{
                    'data-field': 'area_id',
                    multiple: true,
                    onChange: (...args) => calls.push(args),
                    options: [{label: '河北省', value: 130000}],
                    value: [130000],
                }}
            />,
        );
    });

    const cascader = renderer.root.findByType(AntCascader);
    await act(async () => {
        cascader.props.onChange([]);
    });

    expect(calls).toEqual([[[]]]);

    await act(async () => {
        renderer.unmount();
    });
});
