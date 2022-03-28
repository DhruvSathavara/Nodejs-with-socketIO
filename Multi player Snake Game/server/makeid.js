module.exports = {
    makeid,
}

function makeid(length) {
    let result = '';
    let characters = "0123456789ABCDEFGHIJKLMNOPQRTUVWXYZ";
    let characterslegnth = characters.length;
    for (let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * characterslegnth));
    }
    return result
};


