﻿define(['services/logger', 'plugins/router', 'datacontexts/fund.datacontext',
    'datacontexts/fileupload.datacontext', 'viewmodels/funds/browse',
    'datacontexts/comment.datacontext', 'global/session'],
    function (logger, router, datacontext, fileuploadDatacontext, browseVM,
        commentDatacontext, session) {
        var vm = {
            //#region Initialization.
            error: ko.observable(),
            title: 'NEW FUND',
            activate: activate,
            deactivate: deactivate,
            //#endregion

            //#region Properties.
            item: ko.observable(),
            comments: ko.observableArray([]),
            newComment: ko.observable(),
            router: router,
            //#endregion

            //#region Methods.
            initComment: initComment,
            postFiles: postFiles,
            saveComment: saveComment,
            saveItem: saveItem,
            removeFileUpload: removeFileUpload,
            //#endregion
        };

        return vm;

        //#region Internal methods.
        function activate(queryString) {
            logger.log('Create fund view activated', null, 'funds/create', false);

            vm.item(datacontext.createItem({
                Number: 'temporary-' +
                    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                        /[xy]/g, function (c) {
                            var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
                            return v.toString(16);
                        }),
                AreaId: queryString.areaid
            }));

            vm.errors = ko.validation.group(vm.item());
            ga('send', 'pageview', { 'page': window.location.href, 'title': document.title });
            return true;
        }

        function deactivate() {
            vm.error(undefined);
            vm.item(undefined);
            return true;
        }

        function postFiles(data, evt) {
            fileuploadDatacontext.saveNewItem(data, evt, vm.item().FileUploads, vm.error);
        }

        function removeFileUpload(item) {
            if (confirm('Are you sure you want to delete this item?')) {
                var indexOfUpload = vm.item().FileUploads.indexOf(item);

                // Mark upload item for removal when parent item is saved.
                vm.item().FileUploads()[indexOfUpload].destroy(true);
            }
        }

        function initComment() {
            return vm.newComment(new commentDatacontext.createItem({ FundId: vm.fundId() }));
        }

        function saveComment(comment) {
            return commentDatacontext.saveNewItem(comment)
                .done(function (result) {
                    vm.newComment(undefined);
                    vm.comments.push(new commentDatacontext.createItem(result));
                });
        }

        function saveItem(item) {
            if (vm.errors().length === 0) {
                // Remove uploads with errors.
                var uploadItemsWithErrors = item.FileUploads.remove(function (uploadItem) {
                    return uploadItem.errorMessage();
                });

                // Remove uploads marked with destroy.
                var removedUploadItems = item.FileUploads.remove(function (uploadItem) {
                    return uploadItem.destroy();
                });

                // Delete removed files from server.
                $.each(removedUploadItems, function (index, value) {
                    fileuploadDatacontext.deleteItem(value);
                });

                datacontext.saveNewItem(
                    item,
                    [addNewItemToBrowseVM, navigateToBrowseView]);
            } else {
                vm.errors.showAllMessages();
            }
        }

        function addNewItemToBrowseVM(newItem) {
            browseVM.items.push(datacontext.createItem(newItem));
            browseVM.updateNoItemsToShowProperty();
        }

        function navigateToBrowseView(newItem) {
            router.navigate('#/funds/browse');
        }

        //#endregion
    });