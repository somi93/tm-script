const $ = window.jQuery;

export const TmMatchAccordion = {
    bindToggles(target, { selector = '.rnd-acc-head', namespace = 'rndacc', stopPropagation = false } = {}) {
        const root = target?.jquery ? target : $(target);
        if (!root || !root.length) return;

        const eventName = namespace ? `click.${namespace}` : 'click';
        if (namespace) root.off(eventName, selector);

        root.on(eventName, selector, function (e) {
            if (stopPropagation) e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    },
};