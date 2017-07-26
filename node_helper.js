"use strict";

/* Magic Mirror
 * Module: MMM-max
 *
 * By mirko30000
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');

var MaxCube = require('./maxcube/maxcube');

var cache = [];
var cacheIndex = [];

module.exports = NodeHelper.create({

    start: function () {
        console.log("Starting max helper");
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MAX_UPDATE') {
            console.log("Triggering MAX update");
            var self = this;
            var config = payload;
            var myMaxCube = new MaxCube(config.maxIP, config.maxPort);
            myMaxCube.on('connected', function () {

                myMaxCube.getDeviceStatus().then(function (devices) {
                    var rooms = [];

                    for (var i = 0; i < devices.length; i++) {
                        var item = devices[i];
                        item.deviceInfo = myMaxCube.getDeviceInfo(item.rf_address);
                        var room;

                        if (item.deviceInfo.room_name in rooms) {
                            room = rooms[item.deviceInfo.room_name];
                        } else {
                            room = {
                                name: item.deviceInfo.room_name,
                                valve: 0
                            };
                        }

                        switch (item.deviceInfo.device_type) {
                            case 1:
                                room.valve = (room.valve + item.valve) / 2;
                                if (item.setpoint !== 0)
                                    room.setpoint = item.setpoint;
                                room.mode = item.mode;
                                break;
                            case 2:
                                room.valve = (room.valve + item.valve) / 2;
                                if (item.setpoint !== 0)
                                    room.setpoint = item.setpoint;
                                room.mode = item.mode;
                                break;
                            case 3:
                                if (item.temp !== 0)
                                    room.temp = item.temp;
                                if (item.setpoint !== 0)
                                    room.setpoint = item.setpoint;
                                room.mode = item.mode;
                                break;
                            case 4:
                                break;
                        }

                        // sometimes the temperature ist not given, initialize it with "-"
                        if (!room.temp) {
                            room.temp = -1;
                        }
                        rooms[room.name] = room;
                    }
                    var transfer_rooms = []; //sendSocketNotification can not handle associated arrays
                    for(room in rooms) {
                        transfer_rooms.push(rooms[room]);
                    }
                    self.sendSocketNotification('MAX_DATA', transfer_rooms);
                    myMaxCube.close();
                });
            });
        }
    }
});
