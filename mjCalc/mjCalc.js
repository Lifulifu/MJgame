
function ids2cat(ids) { // to category
    var result = {
        'w': new Array(9).fill(0), 
        't': new Array(9).fill(0), 
        's': new Array(9).fill(0), 
        'z': new Array(7).fill(0)
    }
    for(id of ids) {
        if(id <= 8) // wan ID 0~8
            result.w[id]++;
        else if(id <= 17) // ton ID 9~17
            result.t[id-9]++;
        else if(id <= 26) // sou ID 18~26
            result.s[id-18]++;
        else // zi ID 27~33
            result.z[id-27]++;
    }
    return result;
}

function cat2id(col, i) {
    if(col == 'w')
        return i;
    else if(col == 't')
        return 9+i;
    else if(col == 's')
        return 18+i;
    else 
        return 27+i;
}

function name2ids(hand){
    let result = [];
    for(let hai of hand){
        if(hai[1] == 'w')
            result.push(parseInt(hai[0])-1);
        else if(hai[1] == 't')
            result.push(9 + parseInt(hai[0])-1);
        else if(hai[1] == 's')
            result.push(18 + parseInt(hai[0])-1);
        else
            result.push(27 + parseInt(hai[0])-1);
    }
    return result;
}

function ids2name(ids) {
    let result = [];
    for(let id of ids){
        let col = Math.floor(id / 9);
        let i = id % 9;
        if(col == 0)
            result.push(toString(i+1) + 'w');
        else if(col == 1)
            result.push(toString(i+1) + 't');
        else if(col == 2)
            result.push(toString(i+1) + 's');
        else
            result.push(toString(i+1) + 'z');
    }
    return result;
}

function logArr(arr){
    for(let v of arr)
        console.log(v);
}

function agari(ids) {
    let x = ids2cat(ids);
    for(let col in x){
        for(let i in col){
            if(x[col][i] >= 2){
                x[col][i] -= 2; // take out pair
                if(divide3(x))
                    return true;
                else return false;
            }
        }
    }
}

function divide3(x, agariHand, agariHands) {
    if(isEmpty(x)){
        agariHands.push(agariHand.slice()); // clone hand and add to hands
    }
    for(let col in x){
        for(let i=0; i<x[col].length; i++){
            // check 111
            if(x[col][i] >= 3){
                x[col][i] -= 3;
                let t = cat2id(col, i);
                agariHand.push([t,t,t]);

                divide3(x, agariHand, agariHands)

                agariHand.pop();
                x[col][i] += 3;
            }
            // check 123
            if(col!='z' && i<=6 && x[col][i]>=1 && x[col][i+1]>=1 && x[col][i+2]>=1){
                x[col][i]--;
                x[col][i+1]--;
                x[col][i+2]--;
                agariHand.push([
                    cat2id(col, i),
                    cat2id(col, i+1),
                    cat2id(col, i+2)
                ]);

                divide3(x, agariHand, agariHands);

                agariHand.pop();
                x[col][i]++;
                x[col][i+1]++;
                x[col][i+2]++;
            }
        }
    }
}

function isEmpty(cat) {
    let haveValue = false;
    for(let col in cat){
        for(let i in col){
            if(cat[col][i] > 0)
                haveValue = true;
        }
    }
    return !haveValue;
}

var cat = ids2cat(name2ids(['1s','2s','2s','3s','3s','4s']));
var agariHands = []
divide3(cat, [], agariHands)
console.table(agariHands);


