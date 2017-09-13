const searcher = (()=>{
    let arr;
    function priceClicked(e) {
        arr = [];
        let currentClickedElementValue = $(e).get()[0].control.name;
        currentClickedElementValue.split(/[^0-9]+/g).forEach(e => arr.push(+e));
        getAllClicked();
    }

    function getAllClicked() {
        let checked = $("input:checked");
        if(checked.length > 0){
            for (let item of checked) {
                arr.push(item.name.split(/[^0-9]+/g).forEach(e => arr.push(+e)));
            }
        }
        arr = arr.filter(e=> e !== undefined).sort((a,b) => a - b);
        let min = arr[0];
        let max = arr[arr.length-1];
        requester.get('appdata', `Tickets?query={"$and":[{"Price":{"$gte":"${min}"}}, {"Price":{"$lte":"${max}"}}]}`, '')
            .then((tickets)=>{
            let tick = '';
            let ev = '';
                for (let ticket of tickets) {
                    tick+=`{"EventId":{"$eq":"${ticket.EventId}"}}, `;
                    ev+= `"${ticket.EventId}", `;
                }
                tick = tick.slice(0, tick.length-2);
                ev = ev.slice(0, ev.length-2);
                sessionStorage.setItem('ids', tick);
                sessionStorage.setItem('evIds', ev);

                let loc = document.location.hash;
                if(loc === '#/events/filtered'){
                    location.reload();
                }else {
                    document.location.href = '#/events/filtered';
                }
            }).catch((e) => messageBox.showError(e));
    }

    return {
        priceClicked
    }
})();
