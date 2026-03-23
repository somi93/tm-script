const toNumber = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(' ');

const buildBar = ({ leftNumber, rightNumber, barClass, leftSegmentClass, rightSegmentClass }) => {
    const left = toNumber(leftNumber);
    const right = toNumber(rightNumber);
    const total = left + right;
    const leftPct = total === 0 ? 50 : Math.round((left / total) * 100);
    const rightPct = 100 - leftPct;

    return `<div class="${barClass}"><div class="${leftSegmentClass}" style="width:${leftPct}%"></div><div class="${rightSegmentClass}" style="width:${rightPct}%"></div></div>`;
};

const leadClasses = (leftNumber, rightNumber, leftLeadClass, rightLeadClass) => {
    const left = toNumber(leftNumber);
    const right = toNumber(rightNumber);
    return {
        left: left > right ? leftLeadClass : '',
        right: right > left ? rightLeadClass : '',
    };
};

export const TmMatchComparisonRow = {
    stacked({
        label,
        leftValue,
        rightValue,
        leftNumber = leftValue,
        rightNumber = rightValue,
        rowClass,
        headerClass,
        leftValueClass,
        rightValueClass,
        labelClass,
        barClass,
        leftSegmentClass,
        rightSegmentClass,
        leftLeadClass = '',
        rightLeadClass = '',
    }) {
        const lead = leadClasses(leftNumber, rightNumber, leftLeadClass, rightLeadClass);

        return `<div class="${rowClass}"><div class="${headerClass}"><span class="${joinClassNames(leftValueClass, lead.left)}">${leftValue}</span><span class="${labelClass}">${label}</span><span class="${joinClassNames(rightValueClass, lead.right)}">${rightValue}</span></div>${buildBar({ leftNumber, rightNumber, barClass, leftSegmentClass, rightSegmentClass })}</div>`;
    },

    mirrored({
        label,
        leftValue,
        rightValue,
        leftNumber = leftValue,
        rightNumber = rightValue,
        rowClass,
        leftValueClass,
        rightValueClass,
        labelClass,
        barClass,
        leftSegmentClass,
        rightSegmentClass,
        leftLeadClass = '',
        rightLeadClass = '',
    }) {
        const lead = leadClasses(leftNumber, rightNumber, leftLeadClass, rightLeadClass);
        const bar = buildBar({ leftNumber, rightNumber, barClass, leftSegmentClass, rightSegmentClass });

        return `<div class="${rowClass}"><span class="${joinClassNames(leftValueClass, lead.left)}">${leftValue}</span>${bar}<span class="${labelClass}">${label}</span>${bar}<span class="${joinClassNames(rightValueClass, lead.right)}">${rightValue}</span></div>`;
    },
};