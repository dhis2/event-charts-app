import './css/style.css';

import objectApplyIf from 'd2-utilizr/lib/objectApplyIf';
import arrayTo from 'd2-utilizr/lib/arrayTo';

import { createChart } from 'd2-charts-api';

import { api, table, manager, config, init, util } from 'd2-analysis';

import { Dimension } from './api/Dimension';
import { Layout } from './api/Layout';
import { InstanceManager } from './manager/InstanceManager';

// extend
api.Dimension = Dimension;
api.Layout = Layout;
manager.InstanceManager = InstanceManager;

// references
var refs = {
    api,
    init
};

// inits
var inits = [
    init.legendSetsInit,
    init.dimensionsInit,
    // init.optionSetsInit
];

// dimension config
var dimensionConfig = new config.DimensionConfig();
refs.dimensionConfig = dimensionConfig;

// option config
var optionConfig = new config.OptionConfig();
refs.optionConfig = optionConfig;

// period config
var periodConfig = new config.PeriodConfig();
refs.periodConfig = periodConfig;

    // chart config
var chartConfig = new config.ChartConfig();
refs.chartConfig = chartConfig;

// app manager
var appManager = new manager.AppManager(refs);
appManager.sessionName = 'eventchart';
appManager.apiVersion = 26;
refs.appManager = appManager;

// calendar manager
var calendarManager = new manager.CalendarManager(refs);
refs.calendarManager = calendarManager;

// request manager
var requestManager = new manager.RequestManager(refs);
refs.requestManager = requestManager;

// i18n manager
var i18nManager = new manager.I18nManager(refs);
refs.i18nManager = i18nManager;

// session storage manager
var sessionStorageManager = new manager.SessionStorageManager(refs);
refs.sessionStorageManager = sessionStorageManager;

// indexed db manager
// var indexedDbManager = new manager.IndexedDbManager(refs);
// refs.indexedDbManager = indexedDbManager;

// dependencies
dimensionConfig.setI18nManager(i18nManager);
dimensionConfig.init();
optionConfig.setI18nManager(i18nManager);
optionConfig.init();
periodConfig.setI18nManager(i18nManager);
periodConfig.init();

appManager.applyTo(arrayTo(api));
optionConfig.applyTo(arrayTo(api));

// plugin
function render(plugin, layout) {
    var instanceRefs = Object.assign({}, refs);

    // ui manager
    var uiManager = new manager.UiManager(instanceRefs);
    instanceRefs.uiManager = uiManager;
    uiManager.applyTo(arrayTo(api));
    uiManager.preventMask = true;

    // instance manager
    var instanceManager = new manager.InstanceManager(instanceRefs);
    instanceRefs.instanceManager = instanceManager;
    instanceManager.apiResource = 'eventChart';
    instanceManager.apiEndpoint = 'eventCharts';
    instanceManager.apiModule = 'dhis-web-event-visualizer';
    instanceManager.plugin = true;
    instanceManager.dashboard = eventChartPlugin.dashboard;
    instanceManager.applyTo(arrayTo(api));

    // initialize
    uiManager.setInstanceManager(instanceManager);

    // instance manager
    instanceManager.setFn(function(_layout) {
        var el = _layout.el;
        var element = document.getElementById(el);
        var response = _layout.getResponse();
        var extraOptions = {
            dashboard: instanceManager.dashboard
        };

        var { chart } = createChart(response, _layout, el, extraOptions);

        // reg
        uiManager.reg(chart, 'chart');

        // dashboard item resize
		element.setViewportWidth = function (width) {
			chart.setSize(width, undefined, {duration: 50});
        };

        element.setViewportHeight = function (height) {
			chart.setSize(undefined, height, {duration: 50});
        };

        element.setViewportSize = function (width, height) {
			chart.setSize(width, height, {duration: 50});
		};

        // mask
        uiManager.unmask();
    });

    if (plugin.loadingIndicator) {
        uiManager.renderLoadingIndicator(layout.el);
    }

    if (layout.id) {
        instanceManager.getById(layout.id, function(_layout) {
            _layout = new api.Layout(instanceRefs, objectApplyIf(layout, _layout));

            instanceManager.getReport(_layout);
        });
    }
    else {
        instanceManager.getReport(new api.Layout(instanceRefs, layout));
    }
};

global.eventChartPlugin = new util.Plugin({ refs, inits, renderFn: render });
