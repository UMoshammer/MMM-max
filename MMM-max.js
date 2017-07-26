/* global Module */

/* Magic Mirror
 * Module: MMM-max
 *
 * By mirko3000
 * MIT Licensed.
 */

Module.register('MMM-max', {

    requiresVersion: "2.0.0",

    defaults: {
        fade: true,
        fadePoint: 0.25,
        maxIP: '192.168.0.252',
        maxPort: 62910,
        updateInterval: 5,
        twoColLayout: false,
        toDisplay: []
    },


    // Override socket notification handler.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MAX_DATA') {
            Log.info('received MAX_DATA');
            this.render(payload);
            this.updateDom(3000);
        }
    },

    start: function () {
        Log.info("Starting module: " + this.name);
        this.update();
        // refresh every x minutes
        setInterval(
            this.update.bind(this),
            this.config.updateInterval * 60 * 1000);
    },

    update: function () {
        var maxConfig = {
            maxIP: this.config.maxIP,
            maxPort: this.config.maxPort
        };

        this.sendSocketNotification(
            'MAX_UPDATE', maxConfig);
    },

    getScripts: function () {
        return [
            'String.format.js',
            'https://code.jquery.com/jquery-2.2.3.min.js',  // this file will be loaded from the jquery servers.
            'https://use.fontawesome.com/e32f11f60f.js' //TODO: replace with local Fontawsome files
        ]
    },

    getStyles: function () {
        return ['MMM-max.css'];
    },

    getDom: function () {
        var content = '';
        if (!this.loaded) {
            content = this.html.loading;
        } else {
            content = '<ul>' + this.dom + '</ul>';
        }
        return $('<div class="max">' + content + '</div>')[0];
    },


    html: {
        table: '<table>{0}</table>',
        col: '<td align="left" class="normal light small">{0}</td><td align="left" class="dimmed light xsmall">{1}°C</td><td align="left" class="dimmed light xsmall">{2}°C</td><td align="left" class="dimmed light xsmall">{3}%</td><td class="dimmed xsmall light"><div class="fa fa-1 {4}"></div></td>',
        row: '<tr>{0}{1}</tr>',
        room: '<li><div class="room xsmall">{0} : {1}°C</div></li>',
        loading: '<div class="dimmed light xsmall">Connecting to MAX! cube...</div>'
    },

    render: function (data) {
        var previousCol = '';
        var tableText = '';
        var rowCount = 0;
        var currCols = [];

        data.forEach(function (room) {
            if (this.config.toDisplay.length === 0 || this.config.toDisplay.indexOf(room.name) !== 1) {
                var icon = "";
                // Check for automatic or manual mode
                if (room.mode === "VACATION") {
                    icon = "fa-plane";
                }
                else if (room.mode === "AUTO") {
                    icon = "fa-dashboard";
                } else {
                    icon = "fa-hand-stop-o";
                }
                currCols.push(this.html.col.format(room.name, room.setpoint, room.temp, room.valve, icon));
            }
        }.bind(this));

        for (var i = 0; i < currCols.length; i++) {
            if (i % 2 !== 0 || !this.config.twoColLayout) {
                // start new row
                tableText += this.html.row.format(previousCol, currCols[i]);
                previousCol = '';
                //rowCount++;
            }
            else {
                previousCol = currCols[i];
            }
        }

        // Print last row if uneven
        if (previousCol !== '') {
            tableText += this.html.row.format(previousCol, '');
            previousCol = '';
            //rowCount++;
        }

        text = this.html.table.format(tableText);

        this.loaded = true;

        // only update dom if content changed
        if (this.dom !== text) {
            this.dom = text;
            this.updateDom(this.config.animationSpeed);
        }
    }
});
