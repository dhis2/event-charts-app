import isArray from 'd2-utilizr/lib/isArray';
import isBoolean from 'd2-utilizr/lib/isBoolean';
import isEmpty from 'd2-utilizr/lib/isEmpty';
import isNumber from 'd2-utilizr/lib/isNumber';
import isNumeric from 'd2-utilizr/lib/isNumeric';
import isObject from 'd2-utilizr/lib/isObject';
import isString from 'd2-utilizr/lib/isString';

import { Record, Layout as d2aLayout } from 'd2-analysis';

export var Layout = function(refs, c, applyConfig, forceApplyConfig) {
    var t = this;

    c = isObject(c) ? c : {};

    // inherit
    Object.assign(t, new d2aLayout(refs, c, applyConfig));
    t.prototype = d2aLayout.prototype;

    // ensure 1 column, 1 row, n filters
    t.stripAxes();

    // todo: global
    t.hideEmptyRowItems = isString(c.hideEmptyRowItems) ? c.hideEmptyRowItems : 'NONE';
    t.completedOnly = isBoolean(c.completedOnly) ? c.completedOnly : false;
    t.sortOrder = isNumber(c.sortOrder) ? c.sortOrder : 0;

    t.type = refs.chartConfig.s2c[c.type] || refs.chartConfig.client[c.type] || refs.chartConfig.client['column'];

    t.program = isObject(c.program) ? c.program : null;
    t.programStage = isObject(c.programStage) ? c.programStage : null;

    t.regressionType = isString(c.regressionType) ? c.regressionType : 'NONE';
    t.outputType = isString(c.outputType) ? c.outputType : refs.optionConfig.getOutputType('event').id;

    t.hideNaData = isBoolean(c.hideNaData) ? c.hideNaData : false;
    t.showValues = isBoolean(c.showData) ? c.showData : (isBoolean(c.showValues) ? c.showValues : true);
    t.percentStackedValues = isBoolean(c.percentStackedValues) ? c.percentStackedValues : false;
    t.cumulativeValues = isBoolean(c.cumulativeValues) ? c.cumulativeValues : false;
    t.hideLegend = isBoolean(c.hideLegend) ? c.hideLegend : false;
    t.hideTitle = isBoolean(c.hideTitle) ? c.hideTitle : false;
    t.hideSubtitle = isBoolean(c.hideSubtitle) ? c.hideSubtitle : false;
    t.subtitle = isString(c.subtitle) && !isEmpty(c.subtitle) ? c.subtitle : null;

    t.targetLineValue = isNumber(c.targetLineValue) ? c.targetLineValue : null;
    t.targetLineTitle = isString(c.targetLineLabel) && !isEmpty(c.targetLineLabel) ? c.targetLineLabel :
        (isString(c.targetLineTitle) && !isEmpty(c.targetLineTitle) ? c.targetLineTitle : null);
    t.baseLineValue = isNumber(c.baseLineValue) ? c.baseLineValue : null;
    t.baseLineTitle = isString(c.baseLineLabel) && !isEmpty(c.baseLineLabel) ? c.baseLineLabel :
        (isString(c.baseLineTitle) && !isEmpty(c.baseLineTitle) ? c.baseLineTitle : null);
    t.rangeAxisMaxValue = isNumber(c.rangeAxisMaxValue) ? c.rangeAxisMaxValue : null;
    t.rangeAxisMinValue = isNumber(c.rangeAxisMinValue) ? c.rangeAxisMinValue : null;
    t.rangeAxisSteps = isNumber(c.rangeAxisSteps) ? c.rangeAxisSteps : null;
    t.rangeAxisDecimals = isNumber(c.rangeAxisDecimals) ? c.rangeAxisDecimals : null;
    t.rangeAxisTitle = isString(c.rangeAxisLabel) && !isEmpty(c.rangeAxisLabel) ? c.rangeAxisLabel :
        (isString(c.rangeAxisTitle) && !isEmpty(c.rangeAxisTitle) ? c.rangeAxisTitle : null);
    t.domainAxisTitle = isString(c.domainAxisLabel) && !isEmpty(c.domainAxisLabel) ? c.domainAxisLabel :
        (isString(c.domainAxisTitle) && !isEmpty(c.domainAxisTitle) ? c.domainAxisTitle : null);

    // value, aggregation type
    if (isObject(c.value) && isString(c.value.id)) {
        t.value = c.value;

        if (isString(c.aggregationType)) {
            t.aggregationType = c.aggregationType;
        }
    }

    // paging
    if (isObject(c.paging) && isNumeric(c.paging.pageSize) && isNumeric(c.paging.page)) {
        t.paging = c.paging;
    }

    // graph map
    t.parentGraphMap = isObject(c.parentGraphMap) ? c.parentGraphMap : null;

    // force apply
    Object.assign(t, forceApplyConfig);

    t.getRefs = function() {
        return refs;
    };
};

Layout.prototype = d2aLayout.prototype;

Layout.prototype.clone = function() {
    var t = this,
        refs = this.getRefs();

    var { Layout } = refs.api;

    var layout = new Layout(refs, JSON.parse(JSON.stringify(t)));

    layout.setResponse(t.getResponse());
    layout.setAccess(t.getAccess());
    layout.setDataDimensionItems(t.getDataDimensionItems());

    return layout;
};

Layout.prototype.toPost = function() {
    var t = this,
        refs = t.getRefs();

    t.toPostSuper();

    t.type = refs.chartConfig.c2s[t.type] || t.type;

    t.showData = t.showValues;
    delete t.showValues;

    t.targetLineLabel = t.targetLineTitle;
	delete t.targetLineTitle;

    t.baseLineLabel = t.baseLineTitle;
	delete t.baseLineTitle;

    t.domainAxisLabel = t.domainAxisTitle;
	delete t.domainAxisTitle;

    t.rangeAxisLabel = t.rangeAxisTitle;
	delete t.rangeAxisTitle;
};

Layout.prototype.getDataTypeUrl = function(dataType) {
    var t = this,
        refs = t.getRefs();

    var { dimensionConfig } = refs;

    var url = dimensionConfig.dataTypeUrl[this.dataType || dataType];

    return url || '';
};

Layout.prototype.getProgramUrl = function() {
    return isObject(this.program) ? ('/' + this.program.id) : '';
};

// dep 1

Layout.prototype.req = function(source, format, isSorted, isTableLayout, isFilterAsDimension) {
    var t = this,
        refs = this.getRefs();

    var { Request } = refs.api;

    var { optionConfig, appManager, instanceManager, dimensionConfig } = refs;

    var request = new Request(refs);

    var defAggTypeId = optionConfig.getAggregationType('def').id,
        displayProperty = this.displayProperty || appManager.getAnalyticsDisplayProperty();

    source = source || instanceManager.analyticsEndpoint + this.getDataTypeUrl(dimensionConfig.getDefaultDataType()) + this.getProgramUrl();

    // dimensions
    this.getDimensions(false, isSorted).forEach(function(dimension) {
        request.add(dimension.url(isSorted));
    });

    // filters
    if (this.filters) {
        this.filters.forEach(function(dimension) {
            var isFilter = !(isFilterAsDimension && dimension.isRequired());

            request.add(dimension.url(isSorted, null, isFilter));
        });
    }

    // stage
    if (isObject(this.programStage)) {
        request.add('stage=' + this.programStage.id);
    }

    // display property
    request.add('displayProperty=' + displayProperty.toUpperCase());

    // normal request only
    if (!isTableLayout) {

        // hierarchy
        if (this.showHierarchy) {
            request.add('hierarchyMeta=true');
        }

        // completed only
        if (this.completedOnly) {
            request.add('completedOnly=true');
        }

        // aggregation type
        if (isString(this.outputType)) {
            request.add('outputType=' + this.outputType);
        }

        // limit, sortOrder
        if (isNumber(this.topLimit) && this.dataType === dimensionConfig.dataType['aggregated_values']) {
            request.add('limit=' + this.topLimit);

            var sortOrder = isNumber(this.sortOrder) ? this.sortOrder : 1;

            request.add('sortOrder=' + (sortOrder < 0 ? 'ASC' : 'DESC'));
        }

        // value, aggregrationType
        if (this.value) {
            request.add('value=' + (isString(this.value) ? this.value : isObject(this.value) ? this.value.id : null));

            if (isString(this.aggregationType)) {
                request.add('aggregationType=' + this.aggregationType);
            }
        }

        // collapse data items
        if (this.collapseDataDimensions) {
            request.add('collapseDataDimensions=true');
        }

        // dates
        if (isString(this.startDate) && isString(this.endDate)) {
            request.add('startDate=' + this.startDate);
            request.add('endDate=' + this.endDate);
        }

        // user org unit
        if (isArray(this.userOrgUnit) && this.userOrgUnit.length) {
            request.add(this.getUserOrgUnitUrl());
        }

        // relative period date
        if (this.relativePeriodDate) {
            request.add('relativePeriodDate=' + this.relativePeriodDate);
        }

        // sorting
        if (isObject(this.sorting) && this.dataType === dimensionConfig.dataType['individual_cases']) {
            if (isString(this.sorting.direction) && isString(this.sorting.id)) {
                request.add(this.sorting.direction.toLowerCase() + '=' + this.sorting.id);
            }
        }

        // paging
        if (this.dataType === dimensionConfig.dataType['individual_cases']) {
            var paging = this.paging || {};

            request.add('pageSize=' + (paging.pageSize || 100));
            request.add('page=' + (paging.page || 1));
        }
    }

    // relative orgunits / user
    if (this.hasRecordIds(appManager.userIdDestroyCacheKeys, true)) {
        request.add('user=' + appManager.userAccount.id);
    }

    // base
    request.setBaseUrl(this.getRequestPath(source, format));

    return request;
};

// dep 2

Layout.prototype.data = function(source, format) {
    var t = this,
        refs = this.getRefs();

    var uiManager = refs.uiManager;

    var request = t.req(source, format);

    request.setType(t.getDefaultFormat());

    request.setError(function(r) {

        // 409
        if (isObject(r) && r.status == 409) {
            uiManager.unmask();

            if (isString(r.responseText)) {
                uiManager.alert(JSON.parse(r.responseText));
            }
        }
    });

    return request.run();
};
