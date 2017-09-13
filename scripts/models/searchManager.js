const searcher = (()=>{
    function itemsClicked(ctx) {
        let priceChecked = $('#prices').find("input:checked");
        let locationChecked = $('#locationss').find("input:checked");
        let categoryChecked = $('#category').find("input:checked");
        let locationNames = [];
        for (let item of locationChecked) {
            locationNames.push(item.name);
        }
        let categoryIDs = [];
        for (let item of categoryChecked) {
            categoryIDs.push(item.name);
        }
        if(priceChecked.length > 0){
            let arr = [];
            for (let item of priceChecked) {
                arr.push(item.name.split(/[^0-9]+/g).forEach(e => arr.push(+e)));
            }

            arr = arr.filter(e=> e !== undefined).sort((a,b) => a - b);
            let min = arr[0];
            let max = arr[arr.length-1];
            requester.get('appdata', `Tickets?query={"$and":[{"Price":{"$gte":"${min}"}}, {"Price":{"$lte":"${max}"}}]}`, '')
                .then((tickets)=>{
                    let tick = '';
                    let ev = '';
                    let pic = '';
                    for (let ticket of tickets) {
                        ev+= `"${ticket.EventId}", `;
                    }
                    ev = ev.slice(0, ev.length-2);
                    eventsManager.getEventsInRange(ev)
                        .then((filteredEvents) => {
                            let secondLevelFiltered = [];
                            if(locationNames.length>0 && categoryIDs.length ===0){
                                for (let x = 0; x < filteredEvents.length; x++) {
                                    if(locationNames.some((e) => {return e === filteredEvents[x].Location})){
                                        secondLevelFiltered.push(filteredEvents[x]);
                                    }
                                }
                            }else{
                                for (let x = 0; x < filteredEvents.length; x++) {
                                    if(locationNames.some((e) => {return e === filteredEvents[x].Location})
                                        && categoryIDs.some((e) => {return e === filteredEvents[x].CategoryId})){
                                        secondLevelFiltered.push(filteredEvents[x]);
                                    }
                                }
                            }

                            if(locationNames.length === 0 && categoryIDs.length === 0){
                                secondLevelFiltered = filteredEvents;
                            }

                            for (let filteredEvent of secondLevelFiltered) {
                                tick+=`{"EventId":{"$eq":"${filteredEvent._id}"}}, `;
                                pic+= `"${filteredEvent._id}", `;
                            }

                            tick = tick.slice(0, tick.length-2);
                            pic = pic.slice(0, pic.length-2);
                            sessionStorage.setItem('ids', tick);
                            sessionStorage.setItem('evIds', pic);
                            if(tick === ""){
                                sessionStorage.setItem('ids', "{\"EventId\":{\"$eq\":\"${0}\"}}");
                                sessionStorage.setItem('evIds', '');
                            }
                            eventsController.displayFiltered(ctx);

                        }).catch((e) => messageBox.handleError(e));
                }).catch((e) => messageBox.showError(e));
        }else if(locationChecked.length > 0){
            let arr = '';
            let tick = '';
            let pic = '';
            for (let item of locationChecked) {
                arr += `{"Location":{"$eq":"${item.name}"}}, `;
            }
            arr = arr.slice(0, arr.length -2);
            requester.get('appdata', `Events?query={"$or":[${arr}]}`)
                .then((events) =>{
                    let secondLevelFiltered = [];
                    if(categoryIDs.length > 0){
                        for(let event of events) {
                            if (categoryIDs.some((e) => {
                                    return e === event.CategoryId
                                })) {
                                secondLevelFiltered.push(event);
                            }
                        }
                    }else{
                        secondLevelFiltered = events;
                    }
                    for (let event of secondLevelFiltered) {
                        tick+=`{"EventId":{"$eq":"${event._id}"}}, `;
                        pic+= `"${event._id}", `;
                    }
                    tick = tick.slice(0, tick.length-2);
                    pic = pic.slice(0, pic.length-2);
                    sessionStorage.setItem('ids', tick);
                    sessionStorage.setItem('evIds', pic);
                    if(tick === ""){
                        sessionStorage.setItem('ids', "{\"EventId\":{\"$eq\":\"${0}\"}}");
                        sessionStorage.setItem('evIds', '');
                    }
                    eventsController.displayFiltered(ctx);
                })
                .catch((e) => messageBox.showError(e));
        }else if(categoryIDs.length > 0){
            let arr = '';
            let tick = '';
            let pic = '';
            for (let item of categoryIDs) {
                arr += `{"CategoryId":{"$eq":"${item}"}}, `;
            }
            arr = arr.slice(0, arr.length -2);
            requester.get('appdata', `Events?query={"$or":[${arr}]}`)
                .then((events) =>{
                    for (let event of events) {
                        tick+=`{"EventId":{"$eq":"${event._id}"}}, `;
                        pic+= `"${event._id}", `;
                    }
                    tick = tick.slice(0, tick.length-2);
                    pic = pic.slice(0, pic.length-2);
                    sessionStorage.setItem('ids', tick);
                    sessionStorage.setItem('evIds', pic);
                    if(tick === ""){
                        sessionStorage.setItem('ids', "{\"EventId\":{\"$eq\":\"${0}\"}}");
                        sessionStorage.setItem('evIds', '');
                    }
                    eventsController.displayFiltered(ctx);
                })
                .catch((e) => messageBox.showError(e));
        }
    }

    return {
        itemsClicked
    }
})();
