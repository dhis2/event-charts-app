import isString from 'd2-utilizr/lib/isString';
import isNumber from 'd2-utilizr/lib/isNumber';
import isBoolean from 'd2-utilizr/lib/isBoolean';
import isObject from 'd2-utilizr/lib/isObject';

// Options window components
import { CumulativeValuesCheckbox } from 'd2-analysis/lib/ui/options/CumulativeValues';
import { PercentStackedValuesCheckbox } from 'd2-analysis/lib/ui/options/PercentStackedValues';
import { ShowValuesCheckbox } from 'd2-analysis/lib/ui/options/ShowValues';
import { HideLegendCheckbox } from 'd2-analysis/lib/ui/options/HideLegend';
import { HideNaDataCheckbox } from 'd2-analysis/lib/ui/options/HideNaData';
import { RegressionTypeSelect } from 'd2-analysis/lib/ui/options/RegressionType';
import { SortOrderSelect } from 'd2-analysis/lib/ui/options/SortOrder';
import { OutputTypeSelect } from 'd2-analysis/lib/ui/options/OutputType';
import { ProgramStatusSelect } from 'd2-analysis/lib/ui/options/ProgramStatus';
import { EventStatusSelect } from 'd2-analysis/lib/ui/options/EventStatus';
import { HideEmptyRowItemsSelect } from 'd2-analysis/lib/ui/options/HideEmptyRowItems';
import { CompletedOnlyCheckbox } from 'd2-analysis/lib/ui/options/CompletedOnly';
import { AxisContainer } from 'd2-analysis/lib/ui/options/Axis';
import { TitleContainer } from 'd2-analysis/lib/ui/options/Title';
import { SubtitleContainer } from 'd2-analysis/lib/ui/options/Subtitle';
import { AggregationTypeSelect } from 'd2-analysis/lib/ui/options/AggregationType';
import { TargetLineContainer } from 'd2-analysis/lib/ui/options/TargetLine';
import { BaseLineContainer } from 'd2-analysis/lib/ui/options/BaseLine';

export var AggregateOptionsWindow;

AggregateOptionsWindow = function(refs) {
    var t = this,

        appManager = refs.appManager,
        uiManager = refs.uiManager,
        instanceManager = refs.instanceManager,
        i18n = refs.i18nManager.get(),
        optionConfig = refs.optionConfig,

        // data
        showValues = ShowValuesCheckbox(refs),
        percentStackedValues = PercentStackedValuesCheckbox(refs),
        cumulativeValues = CumulativeValuesCheckbox(refs),
        hideEmptyRowItems = HideEmptyRowItemsSelect(refs),
        regressionType = RegressionTypeSelect(refs),
        targetLineContainer = TargetLineContainer(refs),
        baseLineContainer = BaseLineContainer(refs),
        sortOrder = SortOrderSelect(refs),
        outputType = OutputTypeSelect(refs),
        programStatus = ProgramStatusSelect(refs),
        eventStatus = EventStatusSelect(refs),

        axisContainer = AxisContainer(refs),

        hideLegend = HideLegendCheckbox(refs),
        titleContainer = TitleContainer(refs),
        subtitleContainer = SubtitleContainer(refs),

        hideNaData = HideNaDataCheckbox(refs),

        completedOnly = CompletedOnlyCheckbox(refs);

    var data = {
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            showValues,
            percentStackedValues,
            cumulativeValues,
            hideNaData,
            completedOnly,
            {
                xtype: 'container',
                style: 'margin-top:9px'
            },
            hideEmptyRowItems,
            regressionType,
            targetLineContainer,
            baseLineContainer,
            sortOrder,
            outputType,
            programStatus,
            eventStatus
        ]
    };

    // general
    var general = {
        bodyStyle: 'border:0 none',
        style: 'margin-left:14px',
        items: [
            hideLegend,
            {
                xtype: 'container',
                style: 'margin-top:7px'
            },
            titleContainer,
            subtitleContainer
        ]
    };

    var window = Ext.create('Ext.window.Window', {
        title: i18n.chart_options,
        bodyStyle: 'background-color:#fff; padding:2px',
        closeAction: 'hide',
        autoShow: true,
        modal: true,
        hideOnBlur: true,
        reset: function() {
            this.setOptions();
        },
        getOptions: function() {
            return {
                showValues: showValues.getValue(),
                percentStackedValues: percentStackedValues.getValue(),
                cumulativeValues: cumulativeValues.getValue(),
                hideEmptyRowItems: hideEmptyRowItems.getValue(),
                hideNaData: hideNaData.getValue(),
                regressionType: regressionType.getValue(),
                completedOnly: completedOnly.getValue(),
                targetLineValue: targetLineContainer.targetLineValueInput.getValue(),
                targetLineTitle: targetLineContainer.targetLineTitleInput.getValue(),
                baseLineValue: baseLineContainer.baseLineValueInput.getValue(),
                baseLineTitle: baseLineContainer.baseLineTitleInput.getValue(),
                sortOrder: sortOrder.getValue(),
                outputType: outputType.getValue(),
                programStatus: programStatus.getValue(),
                eventStatus: eventStatus.getValue(),
                rangeAxisMaxValue: axisContainer.rangeAxisMaxValueInput.getValue(),
                rangeAxisMinValue: axisContainer.rangeAxisMinValueInput.getValue(),
                rangeAxisSteps: axisContainer.rangeAxisStepsInput.getValue(),
                rangeAxisDecimals: axisContainer.rangeAxisDecimalsInput.getValue(),
                rangeAxisTitle: axisContainer.rangeAxisTitleInput.getValue(),
                domainAxisTitle: axisContainer.domainAxisTitleInput.getValue(),
                hideLegend: hideLegend.getValue(),
                hideTitle: titleContainer.hideTitleCheckbox.getValue(),
                title: titleContainer.titleInput.getValue(),
                hideSubtitle: subtitleContainer.hideSubtitleCheckbox.getValue(),
                subtitle: subtitleContainer.subtitleInput.getValue()
            };
        },
        setOptions: function(layout) {
            layout = layout || {};

            showValues.setValue(isBoolean(layout.showValues) ? layout.showValues : true);
            percentStackedValues.setValue(isBoolean(layout.percentStackedValues) ? layout.percentStackedValues : false);
            cumulativeValues.setValue(isBoolean(layout.cumulativeValues) ? layout.cumulativeValues : false);
            hideEmptyRowItems.setValue(isString(layout.hideEmptyRowItems) ? layout.hideEmptyRowItems : 'NONE');
            hideNaData.setValue(isBoolean(layout.hideNaData) ? layout.hideNaData : false);
            regressionType.setValue(isString(layout.regressionType) ? layout.regressionType : 'NONE');

            completedOnly.setValue(isBoolean(layout.completedOnly) ? layout.completedOnly : false);

            // target line
            if (isNumber(layout.targetLineValue)) {
                targetLineContainer.targetLineValueInput.setValue(layout.targetLineValue);
            }
            else {
                targetLineContainer.targetLineValueInput.reset();
            }

            if (isString(layout.targetLineTitle)) {
                targetLineContainer.targetLineTitleInput.setValue(layout.targetLineTitle);
            }
            else {
                targetLineContainer.targetLineTitleInput.reset();
            }

            // base line
            if (isNumber(layout.baseLineValue)) {
                baseLineContainer.baseLineValueInput.setValue(layout.baseLineValue);
            }
            else {
                baseLineContainer.baseLineValueInput.reset();
            }

            if (isString(layout.baseLineTitle)) {
                baseLineContainer.baseLineTitleInput.setValue(layout.baseLineTitle);
            }
            else {
                baseLineContainer.baseLineTitleInput.reset();
            }

            sortOrder.setValue(isNumber(layout.sortOrder) ? layout.sortOrder : 0);

            outputType.setValue(isString(layout.outputType) ? layout.outputType : optionConfig.getOutputType('event').id);

            programStatus.setValue(isString(layout.programStatus) ? layout.programStatus : optionConfig.getProgramStatus('def').id);

            eventStatus.setValue(isString(layout.eventStatus) ? layout.eventStatus : optionConfig.getEventStatus('def').id);

            // rangeAxisMaxValue
            if (isNumber(layout.rangeAxisMaxValue)) {
                axisContainer.rangeAxisMaxValueInput.setValue(layout.rangeAxisMaxValue);
            }
            else {
                axisContainer.rangeAxisMaxValueInput.reset();
            }

            // rangeAxisMinValue
            if (isNumber(layout.rangeAxisMinValue)) {
                axisContainer.rangeAxisMinValueInput.setValue(layout.rangeAxisMinValue);
            }
            else {
                axisContainer.rangeAxisMinValueInput.reset();
            }

            // rangeAxisSteps
            if (isNumber(layout.rangeAxisSteps)) {
                axisContainer.rangeAxisStepsInput.setValue(layout.rangeAxisSteps);
            }
            else {
                axisContainer.rangeAxisStepsInput.reset();
            }

            // rangeAxisDecimals
            if (isNumber(layout.rangeAxisDecimals)) {
                axisContainer.rangeAxisDecimalsInput.setValue(layout.rangeAxisDecimals);
            }
            else {
                axisContainer.rangeAxisDecimalsInput.reset();
            }

            // range axis title
            if (isString(layout.rangeAxisTitle)) {
                axisContainer.rangeAxisTitleInput.setValue(layout.rangeAxisTitle);
            }
            else {
                axisContainer.rangeAxisTitleInput.reset();
            }

            // domain axis title
            if (isString(layout.domainAxisTitle)) {
                axisContainer.domainAxisTitleInput.setValue(layout.domainAxisTitle);
            }
            else {
                axisContainer.domainAxisTitleInput.reset();
            }

            hideLegend.setValue(isBoolean(layout.hideLegend) ? layout.hideLegend : false);

            // title
            titleContainer.hideTitleCheckbox.setValue(isBoolean(layout.hideTitle) ? layout.hideTitle : false);
            if (isString(layout.title)) {
                titleContainer.titleInput.setValue(layout.title);
            }
            else {
                titleContainer.titleInput.reset();
            }

            // subtitle
            subtitleContainer.hideSubtitleCheckbox.setValue(isBoolean(layout.hideSubtitle) ? layout.hideSubtitle : false);
            if (isString(layout.subtitle)) {
                subtitleContainer.subtitleInput.setValue(layout.subtitle);
            }
            else {
                subtitleContainer.subtitleInput.reset();
            }
        },
        items: [
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-top:4px; margin-bottom:6px; margin-left:5px',
                html: i18n.data
            },
            data,
            {
                bodyStyle: 'border:0 none; padding:7px'
            },
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-bottom:6px; margin-left:5px',
                html: i18n.axes
            },
            axisContainer,
            {
                bodyStyle: 'border:0 none; padding:7px'
            },
            {
                bodyStyle: 'border:0 none; color:#222; font-size:12px; font-weight:bold',
                style: 'margin-bottom:6px; margin-left:5px',
                html: i18n.general
            },
            general
        ],
        bbar: [
            '->',
            {
                text: i18n.hide,
                handler: function() {
                    window.hide();
                }
            },
            {
                text: '<b>' + i18n.update + '</b>',
                handler: function() {
                    instanceManager.getReport();

                    window.hide();
                }
            }
        ],
        listeners: {
            show: function(w) {
                var optionsButton = uiManager.get('optionsButton') || {};

                if (optionsButton.rendered) {
                    uiManager.setAnchorPosition(w, optionsButton);

                    if (!w.hasHideOnBlurHandler) {
                        uiManager.addHideOnBlurHandler(w);
                    }
                }

                // cmp
                w.showValues = showValues;
                w.percentStackedValues = percentStackedValues;
                w.cumulativeValues = cumulativeValues;
                w.hideEmptyRowItems = hideEmptyRowItems;
                w.hideNaData = hideNaData;
                w.regressionType = regressionType;
                w.completedOnly = completedOnly;
                w.targetLineValue = targetLineContainer.targetLineValueInput;
                w.targetLineTitle = targetLineContainer.targetLineTitleInput;
                w.baseLineValue = baseLineContainer.baseLineValueInput;
                w.baseLineTitle = baseLineContainer.baseLineTitleInput;
                w.sortOrder = sortOrder;
                w.outputType = outputType;
                w.programStatus = programStatus;
                w.eventStatus = eventStatus;
                w.rangeAxisMaxValue = axisContainer.rangeAxisMaxValueInput;
                w.rangeAxisMinValue = axisContainer.rangeAxisMinValueInput;
                w.rangeAxisSteps = axisContainer.rangeAxisStepsInput;
                w.rangeAxisDecimals = axisContainer.rangeAxisDecimalsInput;
                w.rangeAxisTitle = axisContainer.rangeAxisTitleInput;
                w.domainAxisTitle = axisContainer.domainAxisTitleInput;
                w.hideLegend = hideLegend;
                w.hideTitle = titleContainer.hideTitleCheckbox;
                w.title = titleContainer.titleInput;
                w.hideSubtitle = subtitleContainer.hideSubtitleCheckbox;
                w.subtitle = subtitleContainer.subtitleInput;
            }
        }
    });

    return window;
};
