import arrayContains from 'd2-utilizr/lib/arrayContains';
import arrayDifference from 'd2-utilizr/lib/arrayDifference';
import arrayFrom from 'd2-utilizr/lib/arrayFrom';
import arrayPluck from 'd2-utilizr/lib/arrayContains';
import clone from 'd2-utilizr/lib/clone';import isString from 'd2-utilizr/lib/isString';
import isArray from 'd2-utilizr/lib/isArray';

export var AggregateLayoutWindow;

AggregateLayoutWindow = function(refs) {
    var t = this,

        uiManager = refs.uiManager,
        instanceManager = refs.instanceManager,
        i18n = refs.i18nManager.get(),
        dimensionConfig = refs.dimensionConfig,
        optionConfig = refs.optionConfig,

        confData = dimensionConfig.get('data'),
        confPeriod = dimensionConfig.get('period'),
        confOrganisationUnit = dimensionConfig.get('organisationUnit'),
        confCategory = dimensionConfig.get('category'),

        dimensionStoreMap = {},

        margin = 1,
        defaultWidth = 210,
        defaultHeight = 220,

        defaultValueId = 'default',
        defaultTimeFieldId = 'EVENT_DATE';

    var getStore = function(applyConfig) {
        var config = {},
            store;

        config.fields = ['id', 'name'];

        Ext.apply(config, applyConfig);

        config.getDimensionNames = function() {
            var dimensionNames = [];

            this.each(function(r) {
                dimensionNames.push(r.data.id);
            });

            return Ext.clone(dimensionNames);
        };

        store = Ext.create('Ext.data.Store', config);

        return store;
    };

    var getStoreKeys = function(store) {
        var keys = [],
            items = store.data.items;

        if (items) {
            for (var i = 0; i < items.length; i++) {
                keys.push(items[i].data.id);
            }
        }

        return keys;
    };

    var colStore = getStore({name: 'colStore'});
    var rowStore = getStore({name: 'rowStore'});
    var fixedFilterStore = getStore({name: 'fixedFilterStore'});
    var filterStore = getStore({name: 'filterStore'});
    var valueStore = getStore({name: 'valueStore'});
    var timeFieldStore = getStore({ name: 'timeFieldStore' });

    // store functions
    valueStore.addDefaultData = function() {
        if (!this.getById(defaultValueId)) {
            this.insert(0, {
                id: defaultValueId,
                name: i18n.number_of_events
            });
        }
    };

    fixedFilterStore.setListHeight = function() {
        var fixedFilterHeight = 26 + (this.getRange().length * 21) + 1;
        fixedFilter.setHeight(fixedFilterHeight);
        filter.setHeight(defaultHeight - fixedFilterHeight);
    };

    timeFieldStore.addDefaultData = function(programType) {
        if (!this.getById(defaultTimeFieldId)) {
            const timeFieldOptions = optionConfig.getTimeFieldRecords();

            if (programType === 'WITH_REGISTRATION') {
                this.add(timeFieldOptions);
            } else {
                this.add(
                    timeFieldOptions.filter(r => r.id.match(/^(EVENT_DATE|CREATED|LAST_UPDATED)$/))
                );
            }
        }
    };

    // gui
    var col = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-bottom:' + margin + 'px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: colStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.series_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    filterStore.add(record);
                });

                ms.store.on('add', function(store, addedRecords) {
                    var range = store.getRange();

                    if (range.length > 1) {
                        var addedIds = addedRecords.map(function(obj) {
                            return obj.internalId;
                        });

                        store.removeAll();

                        for (var i = 0, rec; i < range.length; i++) {
                            rec = Ext.clone(range[i]);

                            if (arrayContains(addedIds, rec.internalId)) {
                                store.add(rec);
                            }
                            else {
                                filterStore.add(rec);
                            }
                        }
                    }

                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var row = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-right:' + margin + 'px; margin-bottom:0px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: rowStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.category_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    filterStore.add(record);
                });

                ms.store.on('add', function(store, addedRecords) {
                    var range = store.getRange();

                    if (range.length > 1) {
                        var addedIds = addedRecords.map(function(obj) {
                            return obj.internalId;
                        });

                        store.removeAll();

                        for (var i = 0; i < range.length; i++) {
                            if (arrayContains(addedIds, range[i].internalId)) {
                                store.add(range[i]);
                            }
                            else {
                                filterStore.add(range[i]);
                            }
                        }
                    }

                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var fixedFilter = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright ns-multiselect-fixed',
        width: defaultWidth,
        height: 26,
        style: 'margin-right:' + margin + 'px; margin-bottom:0',
        valueField: 'id',
        displayField: 'name',
        store: fixedFilterStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: i18n.report_filter,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.on('change', function() {
                    ms.boundList.getSelectionModel().deselectAll();
                });
            }
        }
    });

    var filter = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright ns-multiselect-dynamic',
        width: defaultWidth,
        height: defaultHeight - 26,
        style: 'margin-right:' + margin + 'px; margin-bottom:' + margin + 'px',
        bodyStyle: 'border-top:0 none',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: filterStore,
        listeners: {
            afterrender: function(ms) {
                ms.store.on('add', function() {
                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var aggregationType = Ext.create('Ext.form.field.ComboBox', {
        cls: 'ns-combo h22',
        width: defaultWidth - 4,
        height: 22,
        style: 'margin: 0',
        fieldStyle: 'height: 22px',
        queryMode: 'local',
        valueField: 'id',
        displayField: 'name',
        editable: false,
        disabled: true,
        value: 'COUNT',
        disabledValue: 'COUNT',
        defaultValue: 'AVERAGE',
        setDisabled: function() {
            this.setValue(this.disabledValue);
            this.disable();
        },
        setEnabled: function() {
            this.setValue(this.defaultValue);
            this.enable();
        },
        store: Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: optionConfig.getAggregationTypeRecords(),
        }),
        resetData: function() {
            this.setDisabled();
        },
    });

    var onValueSelect = function(id) {
        id = id || value.getValue();

        if (id === defaultValueId) {
            aggregationType.setDisabled();
        }
        else {
            aggregationType.setEnabled();

            // remove ux and layout item
            if (hasDimension(id, valueStore)) {
                var uxArray = uiManager.get('accordion').getUxArray(id);

                for (var i = 0; i < uxArray.length; i++) {
                    uxArray[i].removeDataElement();
                }
            }
        }
    };

    var value = Ext.create('Ext.form.field.ComboBox', {
        cls: 'ns-combo h24',
        width: defaultWidth - 4,
        height: 24,
        fieldStyle: 'height: 24px',
        style: 'margin-bottom: 1px',
        queryMode: 'local',
        valueField: 'id',
        displayField: 'name',
        editable: false,
        store: valueStore,
        value: defaultValueId,
        setDefaultData: function() {
            valueStore.addDefaultData();
            this.setValue(defaultValueId);
            aggregationType.resetData();
        },
        setDefaultDataIf: function() {
            if (!value.getValue()) {
                this.setDefaultData();
            }
        },
        resetData: function() {
            valueStore.removeAll();
            this.clearValue();
            aggregationType.resetData();
        },
        listeners: {
            select: function(cb, r) {
                onValueSelect(r[0].data.id);
            },
        },
    });

    var timeField = Ext.create('Ext.form.field.ComboBox', {
        cls: 'ns-combo h24',
        width: defaultWidth - 4,
        height: 24,
        fieldStyle: 'height: 24px',
        queryMode: 'local',
        valueField: 'id',
        displayField: 'name',
        editable: false,
        store: timeFieldStore,
        value: defaultTimeFieldId,
        setDefaultData: function(programType) {
            timeFieldStore.addDefaultData(programType);
            this.setValue(defaultTimeFieldId);
        },
        setDefaultDataIf: function() {
            if (!timeField.getValue()) {
                this.setDefaultData();
            }
        },
        resetData: function(programType) {
            timeFieldStore.removeAll();
            this.clearValue();
            this.setDefaultData(programType);
        },
    });

    var val = Ext.create('Ext.panel.Panel', {
        bodyStyle: 'padding: 1px',
        width: defaultWidth,
        height: 220,
        items: [
            {
                xtype: 'container',
                bodyStyle: 'border:0 none',
                style: 'margin-top:3px',
                items: [
                    {
                        xtype: 'label',
                        height: 22,
                        style: 'padding-left: 4px; line-height: 18px; font-weight: bold',
                        text: i18n.aggregation || 'Aggregation',
                    },
                    value,
                    aggregationType,
                ],
            },
            {
                xtype: 'container',
                bodyStyle: 'border:0 none',
                style: 'margin-top:8px',
                items: [
                    {
                        xtype: 'label',
                        height: 22,
                        style: 'padding-left: 4px; line-height: 18px; font-weight: bold',
                        text: i18n.time_field || 'Time field',
                    },
                    timeField,
                ],
            },
        ],
        tbar: {
            height: 25,
            style: 'padding: 1px',
            items: [
                {
                    xtype: 'label',
                    height: 22,
                    style: 'padding-left: 6px; line-height: 22px',
                    text: i18n.value,
                },
            ],
        },
    });

    var selectPanel = Ext.create('Ext.panel.Panel', {
        bodyStyle: 'border:0 none',
        items: [
            {
                xtype: 'container',
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    {
                        xtype: 'container',
                        bodyStyle: 'border:0 none',
                        items: [
                            fixedFilter,
                            filter
                        ]
                    },
                    col
                ]
            },
            {
                xtype: 'container',
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    row,
                    val
                ]
            }
        ]
    });

    var addDimension = function(record, store, excludedStores, force) {
        store = store && force ? store : dimensionStoreMap[record.id] || store || filterStore;

        if (hasDimension(record.id, excludedStores)) {
            if (force) {
                removeDimension(record.id);
                store.add(record);
            }
        }
        else {
            if (record.id !== value.getValue()) {
                store.add(record);
            }
        }
    };

    var removeDimension = function(id, excludedStores) {
        var stores = arrayDifference([colStore, rowStore, filterStore, fixedFilterStore, valueStore], arrayFrom(excludedStores));

        for (var i = 0, store, index; i < stores.length; i++) {
            store = stores[i];
            index = store.findExact('id', id);

            if (index != -1) {
                store.remove(store.getAt(index));
                dimensionStoreMap[id] = store;
            }
        }
    };

    var hasDimension = function(id, excludedStores) {
        var stores = arrayDifference([colStore, rowStore, filterStore, fixedFilterStore, valueStore], arrayFrom(excludedStores));

        for (var i = 0, store, index; i < stores.length; i++) {
            store = stores[i];
            index = store.findExact('id', id);

            if (index != -1) {
                return true;
            }
        }

        return false;
    };

    var saveState = function(map) {
        map = map || dimensionStoreMap;

        colStore.each(function(record) {
            map[record.data.id] = colStore;
        });

        rowStore.each(function(record) {
            map[record.data.id] = rowStore;
        });

        filterStore.each(function(record) {
            map[record.data.id] = filterStore;
        });

        fixedFilterStore.each(function(record) {
            map[record.data.id] = fixedFilterStore;
        });

        //valueStore.each(function(record) {
            //map[record.data.id] = valueStore;
        //});

        return map;
    };

    var resetData = function() {
        var map = saveState({}),
            keys = ['ou', 'pe', 'dates'];

        for (var key in map) {
            if (map.hasOwnProperty(key) && !arrayContains(keys, key)) {
                removeDimension(key);
            }
        }
    };

    var reset = function(isAll, skipValueStores) {
        colStore.removeAll();
        rowStore.removeAll();
        fixedFilterStore.removeAll();
        filterStore.removeAll();

        if (!skipValueStores) {
            valueStore.removeAll();
            valueStore.addDefaultData();

            timeFieldStore.removeAll();
            timeFieldStore.addDefaultData();
        }

        value.clearValue();
        timeField.clearValue();

        if (!isAll) {
            rowStore.add({id: confPeriod.dimensionName, name: confPeriod.name});
            filterStore.add({id: confOrganisationUnit.dimensionName, name: confOrganisationUnit.name});
        }

        fixedFilterStore.setListHeight();
    };

    var setDimensions = function(layout) {

        // empty cache
        dimensionStoreMap = {};

        // columns
        if (isArray(layout.columns)) {
            layout.columns.forEach(function(dimension) {
                addDimension({
                    id: dimension.dimension,
                    name: dimensionConfig.get(dimension.dimension).name
                }, colStore);
            });
        }

        // rows
        if (isArray(layout.rows)) {
            layout.rows.forEach(function(dimension) {
                addDimension({
                    id: dimension.dimension,
                    name: dimensionConfig.get(dimension.dimension).name
                }, rowStore);
            });
        }

        // filters
        if (isArray(layout.filters)) {
            layout.filters.forEach(function(dimension) {
                addDimension({
                    id: dimension.dimension,
                    name: dimensionConfig.get(dimension.dimension).name
                }, filterStore);
            });
        }
    };

    var toggleValueGui = function(param) {
        var collapse = isObject(param) && param.collapseDataItems ? param.collapseDataItems : param;

        val.setDisabled(collapse);
    };

    var window = Ext.create('Ext.window.Window', {
        title: i18n.chart_layout,
        bodyStyle: 'background-color:#fff; padding:' + margin + 'px',
        closeAction: 'hide',
        autoShow: true,
        modal: true,
        resizable: false,
        dataType: dimensionConfig.dataType['aggregated_values'],
        colStore: colStore,
        rowStore: rowStore,
        fixedFilterStore: fixedFilterStore,
        filterStore: filterStore,
        valueStore: valueStore,
        timeFieldStore: timeFieldStore,
        value: value,
        timeField: timeField,
        addDimension: addDimension,
        removeDimension: removeDimension,
        hasDimension: hasDimension,
        dimensionStoreMap: dimensionStoreMap,
        saveState: saveState,
        resetData: resetData,
        reset: reset,
        toggleValueGui: toggleValueGui,
        getDefaultStore: function() {
            return colStore;
        },
        getValueConfig: function() {
            var config = {},
                valueId = value.getValue(),
                timeFieldId = timeField.getValue();

            if (valueId && valueId !== defaultValueId) {
                config.value = {id: valueId};
                config.aggregationType = aggregationType.getValue();
            }

            if (timeFieldId && timeFieldId !== defaultTimeFieldId) {
                config.timeField = timeFieldId;
            }

            return config;
        },
        setValueConfig: function(valueId, aggType) {
            value.setValue(valueId);
            onValueSelect();

            aggregationType.setValue(aggType);
        },
        setTimeField: function(id) {
            this.timeField.setValue(id);
        },
        setDimensions,
        hideOnBlur: true,
        items: selectPanel,
        bbar: [
            '->',
            {
                text: i18n.hide,
                listeners: {
                    added: function(b) {
                        b.on('click', function() {
                            window.hide();
                        });
                    }
                }
            },
            {
                text: '<b>' + i18n.update + '</b>',
                listeners: {
                    added: function(b) {
                        b.on('click', function() {
                            instanceManager.getReport();

                            window.hide();
                        });
                    }
                }
            }
        ],
        listeners: {
            show: function(w) {
                var layoutButton = uiManager.get('layoutButton') || {};

                if (layoutButton.rendered) {
                    uiManager.setAnchorPosition(w, layoutButton);

                    if (!w.hasHideOnBlurHandler) {
                        uiManager.addHideOnBlurHandler(w);
                    }
                }

                // value
                value.setDefaultDataIf();

                // timeField
                timeField.setDefaultDataIf();
            },
            render: function() {
                reset();

                fixedFilterStore.on('add', function() {
                    this.setListHeight();
                });
                fixedFilterStore.on('remove', function() {
                    this.setListHeight();
                });
            }
        }
    });

    return window;
};
