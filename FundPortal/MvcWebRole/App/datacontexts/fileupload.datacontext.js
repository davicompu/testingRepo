﻿define(['datamodels/fileupload.model', 'services/contexthelper'],
    function (model, contextHelper) {
        //#region Public api.
        var datacontext = {
            createItem: createItem,
            saveNewItem: saveNewItem,
            deleteItem: deleteItem,
        };

        return datacontext;
        //#endregion

        //#region Publicly accessible methods.
        function createItem(data) {
            return new model.Item(data);
        }

        function saveNewItem(data, evt, itemObservable, errorObservable) {
            contextHelper.clearErrorMessage(data);

            var files = evt.target.files;
            //var formData = new FormData();
            var url = itemApi('post');
            for (var i = 0, file; file = files[i]; ++i) {
                var formData = new FormData();
                formData.append(file.name, file);
                postFile(formData, url, itemObservable);
            }
        }

        function deleteItem(data, successFunctions) {
            contextHelper.clearErrorMessage(data);
            // Use query string due to period in the file name.
            return contextHelper.ajaxRequest('delete', '/api/fileupload/delete?id=' + data.Id)
                .done(getSucceeded)
                .fail(getFailed);

            function getSucceeded() {
                $.each(successFunctions || [], function (index, value) {
                    if (typeof value === "function") {
                        value();
                    }
                });
            }

            function getFailed(result) {
                data.errorMessage('Error deleting the item: ' +
                    result.statusText);
            }
        }
        //#endregion

        //#region Private properties.
        // Routes.
        function itemApi(action, id) { return '/api/fileupload/' + action + '/' + (id || ''); }

        function postFile(formData, url, itemObservable) {
            var xhr = new XMLHttpRequest();
            xhr.open('post', url, true);
            xhr.onload = function (e) {
                var result = JSON.parse(xhr.response);
                itemObservable.push(createItem(result));
            };
            xhr.send(formData);
        }
        //#endregion
    });