﻿define(['services/logger', 'plugins/router', 'datacontexts/area.datacontext',
    'viewmodels/areas/browse'],
    function (logger, router, datacontext, browseVM) {
        var vm = {
            //#region Initialization.
            error: ko.observable(),
            title: 'EDIT AREA',
            activate: activate,
            deactivate: deactivate,
            //#endregion

            //#region Properties.
            item: ko.observable(),
            //#endregion

            //#region Methods.
            saveItem: saveItem,
            //#endregion
        };

        // Initialize validation group once vm.item is set
        vm.item.subscribe(function (newValue) {
            if (newValue !== undefined) {
                vm.errors = ko.validation.group(newValue);
            }
        });

        return vm;

        //#region Internal methods.
        function activate(id) {
            logger.log('Edit area view activated', null, 'areas/edit', false);
            getArea(id);
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            return true;
        }

        function deactivate() {
            vm.error(undefined);
            vm.item(undefined);
            return true;
        }

        function getArea(id) {
            // Try to get item from the BrowseVM, if initialized.
            ko.utils.arrayFirst(browseVM.items(), function (item) {
                if (item.Id === id) {
                    return vm.item(item);
                }
            });

            // If item wasn't retrieved from BrowseVM, retrieve from DB.
            if (undefined === vm.item()) {
                return datacontext.getItem(id, vm.item, vm.error);
            }
        }

        function saveItem(item) {
            if (vm.errors().length === 0) {
                datacontext.saveChangedItem(
                item,
                [updateChangedItemInBrowseVM, navigateToBrowseView]);
            } else {
                vm.errors.showAllMessages();
            }
        }

        function updateChangedItemInBrowseVM(changedItem) {
            // Remove the changed item from the BrowseVM, if initialized.
            browseVM.items.remove(function (item) {
                return item.Id === changedItem.Id;
            });

            // Add the item back to the BrowseVM reflecting the changes.
            browseVM.items.push(datacontext.createItem(changedItem));

            browseVM.updateNoItemsToShowProperty();
        }

        function navigateToBrowseView(newItem) {
            router.navigate('#/areas/browse');
        }

        //#endregion
    });