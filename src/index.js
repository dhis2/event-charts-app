import '../extjs/resources/css/ext-all-gray.css';
import './css/style.css';
import './css/meringue.css';
import './css/jquery.calendars.picker.css';
import 'd2-analysis/css/ui/GridHeaders.css';

import arrayTo from 'd2-utilizr/lib/arrayTo';
import isObject from 'd2-utilizr/lib/isObject';

import { createChart } from 'd2-charts-api';

import { api, table, manager, config, ui, init, override, ux } from 'd2-analysis';

import { Dimension } from './api/Dimension';
import { Layout } from './api/Layout';
import { InstanceManager } from './manager/InstanceManager';

import { AggregateLayoutWindow } from './ui/AggregateLayoutWindow';
import { AggregateOptionsWindow } from './ui/AggregateOptionsWindow';

// override
override.extOverrides();

// extend
api.Dimension = Dimension;
api.Layout = Layout;
manager.InstanceManager = InstanceManager;

// references
var refs = {
    api,
    table
};

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

    // ui config
var uiConfig = new config.UiConfig();
refs.uiConfig = uiConfig;

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

    // sessionstorage manager
var sessionStorageManager = new manager.SessionStorageManager(refs);
refs.sessionStorageManager = sessionStorageManager;

    // indexeddb manager
var indexedDbManager = new manager.IndexedDbManager(refs);
refs.indexedDbManager = indexedDbManager;

    // ui manager
var uiManager = new manager.UiManager(refs);
refs.uiManager = uiManager;

    // instance manager
var instanceManager = new manager.InstanceManager(refs);
instanceManager.apiResource = 'eventChart';
instanceManager.apiEndpoint = 'eventCharts';
instanceManager.apiModule = 'dhis-web-event-visualizer';
instanceManager.dataStatisticsEventType = 'EVENT_CHART_VIEW';
refs.instanceManager = instanceManager;

// dependencies
uiManager.setInstanceManager(instanceManager);
dimensionConfig.setI18nManager(i18nManager);
optionConfig.setI18nManager(i18nManager);
periodConfig.setI18nManager(i18nManager);
uiManager.setI18nManager(i18nManager);

    // init ux
Object.keys(ux).forEach(key => ux[key](refs));

// requests
appManager.init(() => {
    requestManager.add(new api.Request(refs, init.i18nInit(refs)));
    requestManager.add(new api.Request(refs, init.authViewUnapprovedDataInit(refs)));
    requestManager.add(new api.Request(refs, init.rootNodesInit(refs)));
    requestManager.add(new api.Request(refs, init.organisationUnitLevelsInit(refs)));
    requestManager.add(new api.Request(refs, init.legendSetsInit(refs)));
    requestManager.add(new api.Request(refs, init.optionSetsInit(refs)));
    requestManager.add(new api.Request(refs, init.dimensionsInit(refs, ['filter=dimensionType:eq:ORGANISATION_UNIT_GROUP_SET'])));
    requestManager.add(new api.Request(refs, init.dataApprovalLevelsInit(refs)));
    requestManager.add(new api.Request(refs, init.categoryOptionGroupSetsInit(refs)));

    requestManager.set(initialize);
    requestManager.run();
});

function initialize() {
    // i18n init
    var i18n = i18nManager.get();

    optionConfig.init();
    dimensionConfig.init();
    periodConfig.init();

    // ui config
    uiConfig.checkout('tracker');

    // app manager
    appManager.appName = i18n.event_visualizer || 'Event Visualizer';

    // instance manager
    instanceManager.setFn(function(layout) {
        var response = layout.getResponse();

        var afterLoad = function() {

            // mask
            uiManager.unmask();

            // statistics
            instanceManager.postDataStatistics();
        };

        var el = uiManager.getUpdateComponent().body.id;
        var response = layout.getResponse();

        var { chart } = createChart(response, layout, el);

        // reg
        uiManager.reg(chart, 'chart');

        afterLoad();
    });

    // ui manager
    uiManager.disableRightClick();

    uiManager.enableConfirmUnload();

    uiManager.disallowProgramIndicators = true;

    // intro
    uiManager.introHtmlIsAsync = true;

    const introHtml = function() {
        var html = '<div class="ns-viewport-text" style="padding:20px">';

        html += '<h3>' + i18nManager.get('example1') + '</h3>' +
            '<div>- ' + i18nManager.get('example2') + '</div>' +
            '<div>- ' + i18nManager.get('example3') + '</div>' +
            '<div>- ' + i18nManager.get('example4') + '</div>' +
            '<h3 style="padding-top:20px">' + i18nManager.get('example5') + '</h3>' +
            '<div>- ' + i18nManager.get('example6') + '</div>' +
            '<div>- ' + i18nManager.get('example7') + '</div>' +
            '<div>- ' + i18nManager.get('example8') + '</div>';

        if (appManager.userFavorites.length > 0) {
            html += '<div id="top-favorites" style="margin-top: 20px; padding: 0">';
            html += `<h3>${ i18nManager.get('example9') }</h3>`;


            appManager.userFavorites.forEach(function(favorite) {
                html += '<div>- <a href="javascript:void(0)" class="favorite favorite-li" id="favorite-' + favorite.id + '">' + favorite.name + '</a></div>';
            });

            html += '</div>';
        }

        return html;
    };

    uiManager.setIntroHtml(introHtml());

    uiManager.setUpdateIntroHtmlFn(function() {
        return new api.Request(refs, init.userFavoritesInit(refs)).run()
            .then(() => uiManager.setIntroHtml(introHtml()));
    });

    // windows
    var windows = {
        aggregateLayoutWindow: uiManager.reg(AggregateLayoutWindow(refs), 'aggregateLayoutWindow').hide(),
        aggregateOptionsWindow: uiManager.reg(AggregateOptionsWindow(refs), 'aggregateOptionsWindow').hide()
    };

    uiManager.reg(ui.FavoriteWindow(refs), 'favoriteWindow').hide();

    // viewport
    var northRegion = uiManager.reg(ui.NorthRegion(refs), 'northRegion');

    var eastRegion = uiManager.reg(ui.EastRegion(refs), 'eastRegion');

    var westRegionItems = uiManager.reg(ui.WestRegionTrackerItems(refs), 'accordion');

    var chartTypeToolbar = uiManager.reg(ui.ChartTypeToolbar(refs), 'chartTypeToolbar');

    var defaultIntegrationButton = uiManager.reg(ui.IntegrationButton(refs, {
        isDefaultButton: true,
        btnText: i18n.chart,
        btnIconCls: 'ns-button-icon-chart'
    }), 'defaultIntegrationButton');

    var tableIntegrationButton = ui.IntegrationButton(refs, {
        objectName: 'event-report',
        moduleName: 'dhis-web-event-reports',
        btnIconCls: 'ns-button-icon-table',
        btnText: i18n.table,
        menuItem1Text: i18n.go_to_event_reports,
        menuItem2Text: i18n.open_this_chart_as_table,
        menuItem3Text: i18n.open_last_table
    });

    // viewport
    uiManager.reg(ui.Viewport(refs, {
        northRegion: northRegion,
        eastRegion: eastRegion,
        westRegionItems: westRegionItems,
        chartTypeToolbar: chartTypeToolbar,
        integrationButtons: [
            defaultIntegrationButton,
            tableIntegrationButton
        ],
        DownloadButtonItems: ui.ChartDownloadButtonItems,
    }, {
        getLayoutWindow: function(layout) {
            if (isObject(layout) && layout.dataType === dimensionConfig.dataType['individual_cases'] && windows.queryLayoutWindow) {
                return windows.queryLayoutWindow;
            }

            return windows.aggregateLayoutWindow;
        },
        getOptionsWindow: function(layout) {
            if (isObject(layout) && layout.dataType === dimensionConfig.dataType['individual_cases'] && windows.queryOptionsWindow) {
                return windows.queryOptionsWindow;
            }

            return windows.aggregateOptionsWindow;
        },
    }), 'viewport');

    // subscribe functions to viewport regions to update ui on renew
    uiManager.subscribe('centerRegion', () => {
        if (appManager.userFavorites.length) {
            appManager.userFavorites.forEach(function(favorite) {
                Ext.get('favorite-' + favorite.id).addListener('click', function() {
                    instanceManager.getById(favorite.id, null, true);
                });
            });
        }
    });

    uiManager.update();
}

global.refs = refs;
