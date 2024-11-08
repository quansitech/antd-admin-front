import {RuleObject, StoreValue} from "rc-field-form/lib/interface";

const customRule: Record<string, (rule: RuleObject, value: StoreValue, callback: (error?: string) => void) => any> = {
    notInEnum(rule, value) {
        return !rule.enum?.includes(value);

    }
}

export default customRule