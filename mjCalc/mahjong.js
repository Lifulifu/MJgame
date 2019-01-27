/**
 * 和牌判斷的程式
 * 拉到最下面看使用方式示範
 * 
 * 牌的編號對照：
 * 東, 南, 西, 北 = 0, 2, 4, 6
 * 白, 發, 中 = 10, 12, 14
 * X萬 = 2X
 * X餅 = 3X
 * X條 = 4X
 */

//請使用此函式進行和牌判斷 手牌可以不照順序 不限長度
//傳入手牌 與寶牌"指示牌" 算出所有和牌組合 並回傳點數最高的那一種 未和牌時或不是14張傳回false
function agariJudger(cards, doraPointer) {
    if (cards.length !== 14) {
        console.log("手牌不是14張")
        return false
    }

    var agariCombinations = agariCombinations14(cards)
    //沒和的話
    if (agariCombinations.length == 0) {
        console.log("沒有和牌")
        return false
    }

    //算出斗拉
    var dora = countDoraFromPointer(doraPointer)

    var maxScoreWayToAgari = new AgariCards(agariCombinations[0], dora)
    for (const comb in agariCombinations) {
        if (agariCombinations[comb].score > maxScoreWayToAgari.score) {
            maxScoreWayToAgari = new AgariCards(agariCombinations[comb], dora)
        }
        //console.log(new AgariCards(agariCombinations[comb], dora).toString())
    }
    //console.log(maxScoreWayToAgari.toString())
    return maxScoreWayToAgari
}

//函式從斗拉指示牌算出斗拉
function countDoraFromPointer(doraPointer) {
    var dora
    if (doraPointer < 10) {
        dora = doraPointer + 2
        if (dora == 8) {
            dora = 0
        }
    } else if (doraPointer < 20) {
        dora = doraPointer + 2
        if (dora == 20) {
            dora = 0
        }
    } else {
        dora = doraPointer + 1
        if (dora % 10 == 0) {
            dora -= 9
        }
    }
    return dora
}

//面子的類別 種類有順子、刻子和雀頭 順子用第一張作為代表牌
class Mentsu {
    constructor(type, card) {
        this.type = type
        this.card = card
    }

    //不知道怎麼用靜態列舉
    static get SHUNTSU() {
        return 0
    }
    static get KOOTSU() {
        return 1
    }
    static get JANTOU() {
        return 2
    }
    static get KOKUSHIMUSOU() {
        return 3
    }

    toString() {
        return "type = " + this.type + ", card = " + this.card
    }
}

//不檢查所有輸入 請小心使用
//函式回傳包含所有牌型組合的陣列 未和牌時回傳空陣列
function agariCombinations14(cards) {
    //將資料形式轉換成一個 索引為牌的類別 值為牌的張數 的表格型陣列
    var cardmap = new Array(50).fill(0)
    for (const card in cards) {
        cardmap[cards[card]]++
    }

    var combinations = []
    agariCombinations(cardmap, combinations, [], 1, 4, 0) //四面子一雀頭
    agariCombinations(cardmap, combinations, [], 7, 0, 0) //七對子
    if (isGokushimusou(cardmap)) {
        var gokushi = []
        gokushi.push(new Mentsu(Mentsu.GOKUSHIMUSOU), 0)
        combinations.push(gokushi)
    }

    return combinations
}

//函式使用DFS在陣列combinations中填入所有可能牌型組合
//參數作用如下: 外部函式的牌陣列 已確認組合 現行組合狀態(可能未完成) 剩餘雀頭數 剩餘面子數 當前進度(優化用)
function agariCombinations(cards, combinations, composition, jantouLeft, mentsuLeft, progress) {
    //成功找到葉節點(和牌方式)的話放入陣列
    if (jantouLeft == 0 && mentsuLeft == 0) {
        combinations.push(composition.slice(0))
        //console.log("found")
        return
    }

    //找到要處理的牌
    for (var num = progress; num < cards.length && cards[num] == 0; num++) { }

    //開分枝(雀頭)
    if (jantouLeft !== 0 && cards[num] >= 2) {
        composition.push(new Mentsu(Mentsu.JANTOU, num))
        cards[num] -= 2

        //console.log(composition[composition.length - 1].toString())
        agariCombinations(cards, combinations, composition, jantouLeft - 1, mentsuLeft, num)
        //console.log("return")

        //回溯
        cards[num] += 2;
        composition.pop()
    }

    //開分枝(刻子)
    if (mentsuLeft !== 0 && cards[num] >= 3) {
        composition.push(new Mentsu(Mentsu.KOOTSU, num))
        cards[num] -= 3

        //console.log(composition[composition.length - 1].toString())
        agariCombinations(cards, combinations, composition, jantouLeft, mentsuLeft - 1, num)
        //console.log("return")

        //回溯
        cards[num] += 3
        composition.pop()
    }

    //開分枝(順子)
    if (mentsuLeft !== 0 && cards[num + 1] > 0 && cards[num + 2] > 0) {
        composition.push(new Mentsu(Mentsu.SHUNTSU, num))
        cards[num + 0]--
        cards[num + 1]--
        cards[num + 2]--

        //console.log(composition[composition.length - 1].toString())
        agariCombinations(cards, combinations, composition, jantouLeft, mentsuLeft - 1, num)
        //console.log("return")

        //回溯
        cards[num + 0]++
        cards[num + 1]++
        cards[num + 2]++
        composition.pop()
    }
}

//函式判斷一副手牌是不是國士無雙
function isGokushimusou(cards) {
    const gokushimusou = [0, 2, 4, 6, 10, 12, 14, 21, 29, 31, 39, 41, 49]
    var hasJantou = false
    for (const card in gokushimusou) {
        if (cards[gokushimusou[card]] == 0) {
            return false
        }
        if (cards[gokushimusou[card]] == 2) {
            hasJantou = true
        }
    }

    return hasJantou
}

//役的類別 屬性有名稱和飜數
class Yaku {
    constructor(name, hanCount) {
        this.name = name
        this.hanCount = hanCount
    }

    toString() {
        var result = ""
        result += this.name + "\t\t"
        if (this.name.length < 6) {
            result += "\t" //對齊用
        }
        //役滿不加飜字
        if (this.hanCount % 13 !== 0) {
            result += this.hanCount + "飜"
        }
        result += "\n"
        return result
    }
}

//和牌組合的類別 每副牌可能有多個和牌組合 建構時傳入手牌與斗拉 會計算出 役種 飜數 符數 點數
//屬性agariType顯示如「跳滿」或「1飜30符」等和牌頭銜
class AgariCards {
    constructor(handcard, dora) {
        this.handcard = handcard
        this.fu = this.countFu()
        this.dora = this.countDora(dora)
        this.yakus = this.countYaku()
        this.han = this.countHan()
        this.score = this.countScore()
        this.agariType = this.countAgariType()
    }

    countFu() {
        //七對子25符
        if (this.handcard.length == 7) {
            return 25
        }

        //照著刻子4符 么九8符 雀頭役牌2符的方式計算
        var fu = 20
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.KOOTSU) {
                fu += 4
                if (AgariCards.isYaoChuu(this.handcard[mentsu].card)) {
                    fu += 4
                }
            }
            if (this.handcard[mentsu].type == Mentsu.JANTOU && AgariCards.isYakuHai(this.handcard[mentsu].card)) {
                fu += 2
            }
        }

        //平和不計自摸2符
        if (fu == 20) {
            return fu
        }

        fu += 2
        fu = 10 * Math.ceil(fu / 10) //無條件進位到十位數

        return fu
    }

    countYaku() {
        var yakus = []

        //先做沒有複合役的役滿判斷
        //console.log(this.handcard)
        if (this.handcard[0].type == Mentsu.GOKUSHIMUSOU) {
            yakus.push(new Yaku("国士無双", 13))
            return yakus
        }

        if (this.hasRyuuIiSoo()) {
            yakus.push(new Yaku("緑一色", 26))
            return yakus
        }

        if (this.hasChinRoo()) {
            yakus.push(new Yaku("清老頭", 13))
            return yakus
        }

        if (this.hasChuuRen()) {
            yakus.push(new Yaku("九蓮宝燈", 13))
            return yakus
        }

        //有複合役的役滿
        if (this.hasDaiSuuShii()) {
            yakus.push(new Yaku("大四喜", 26))
        }

        if (this.hasShouSuuShii()) {
            yakus.push(new Yaku("小四喜", 13))
        }

        if (this.hasTsuuIiSoo()) {
            yakus.push(new Yaku("字一色", 13))
        }

        if (this.yakuHai() == 3) {
            yakus.push(new Yaku("大三元", 13))
        }

        //役滿不跟其他役複合
        if (yakus.length !== 0) {
            return yakus
        }

        //預設役
        yakus.push(new Yaku("門前清自摸和", 1))

        //其他可複合役
        if (this.hasChiiToi()) {
            yakus.push(new Yaku("七対子", 2))
        }

        if (this.hasTanYao()) {
            yakus.push(new Yaku("断ヤオ九", 1))
        }

        if (this.hasPinHu()) {
            yakus.push(new Yaku("平和", 1))
        }

        if (this.yakuHai() !== 0) {
            yakus.push(new Yaku("役牌", this.yakuHai()))
        }

        if (this.peeKoo() == 1) {
            yakus.push(new Yaku("一盃口", 1))
        } else if (this.peeKoo() == 2) {
            yakus.push(new Yaku("二盃口", 3))
        }

        if (this.hasSanShoku()) {
            yakus.push(new Yaku("三色同順", 2))
        }

        if (this.hasSanDooKoo()) {
            yakus.push(new Yaku("三色同刻", 2))
        }

        if (this.hasIttsuu()) {
            yakus.push(new Yaku("一気通貫", 2))
        }

        if (this.hasToiToi()) {
            yakus.push(new Yaku("対々和", 2))
        }

        if (this.hasSanAnKoo()) {
            yakus.push(new Yaku("三暗刻", 2))
        }

        if (this.hasChanTa()) {
            yakus.push(new Yaku("混全帯ヤオ九", 2))
        }

        if (this.hasJunChan()) {
            yakus.push(new Yaku("純全帯ヤオ九", 3))
            //將混全帶刪掉
            yakus.splice(yakus.findIndex(function (element) {
                return element.name == "混全帯ヤオ九"
            }), 1)
        }

        if (this.hasHonRoo()) {
            yakus.push(new Yaku("混老頭", 2))
            //將混全帶刪掉
            yakus.splice(yakus.findIndex(function (element) {
                return element.name == "混全帯ヤオ九"
            }), 1)
        }

        if (this.hasShouSanGen()) {
            yakus.push(new Yaku("小三元", 2))
        }

        if (this.hasHonITsu()) {
            yakus.push(new Yaku("混一色", 3))
        }

        if (this.hasChinITsu()) {
            yakus.push(new Yaku("清一色", 6))
            //將混一色刪掉
            yakus.splice(yakus.findIndex(function (element) {
                return element.name == "混一色"
            }), 1)
        }

        if (this.dora !== 0) {
            yakus.push(new Yaku("ドラ", this.dora))
        }

        return yakus
    }

    hasTsuuIiSoo() {
        for (const mentsu in this.handcard) {
            if (!AgariCards.isTsuuHai(this.handcard[mentsu].card)) {
                return false
            }
        }
        return true
    }

    hasRyuuIiSoo() {
        const ryuuiisoo = [12, 42, 43, 44, 46, 48]
        for (const mentsu in this.handcard) {
            if (!ryuuiisoo.includes(this.handcard[mentsu].card)) {
                return false
            }
            if (this.handcard[mentsu].type == Mentsu.SHUNTSU && this.handcard[mentsu].card !== 42) {
                return false
            }
        }
        return true
    }

    hasChinRoo() {
        for (const mentsu in this.handcard) {
            if (AgariCards.isFuuPai(this.handcard[mentsu].card) || AgariCards.isYakuHai(this.handcard[mentsu].card)) {
                return false
            }
        }
        return this.hasHonRoo()
    }

    hasChuuRen() {
        //九連寶燈判斷
        return false
    }

    hasShouSuuShii() {
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.JANTOU) {
                if (AgariCards.isFuuPai(this.handcard[mentsu].card)) {
                    return this.fuuPai() == 3
                } else {
                    return false
                }
            }
        }
        return false
    }

    hasDaiSuuShii() {
        return this.fuuPai == 4
    }

    fuuPai() {
        var fuupaiCount = 0
        for (const mentsu in this.handcard) {
            if (AgariCards.isFuuPai(this.handcard[mentsu].card) && this.handcard[mentsu].type == Mentsu.KOOTSU) {
                fuupaiCount++
            }
        }
        return fuupaiCount
    }

    hasTanYao() {
        const yaochuu = [0, 2, 4, 6, 10, 12, 14, 21, 29, 31, 39, 41, 49]

        for (const mentsu in this.handcard) {
            if (yaochuu.includes(this.handcard[mentsu].card)) {
                return false
            }
            if (this.handcard[mentsu].type == Mentsu.SHUNTSU && yaochuu.includes(this.handcard[mentsu].card + 2)) {
                return false
            }
        }
        return true
    }

    hasPinHu() {
        return this.fu == 20
    }

    yakuHai() {
        var yakuhaiCount = 0
        for (const mentsu in this.handcard) {
            if (AgariCards.isYakuHai(this.handcard[mentsu].card) && this.handcard[mentsu].type !== Mentsu.JANTOU) {
                yakuhaiCount++
            }
        }
        return yakuhaiCount
    }

    peeKoo() {
        var peekooCount = 0
        for (const mentsu in this.handcard) {
            //最後的-1判斷是為了避免111222333算到兩次
            if (this.handcard[mentsu].type == Mentsu.SHUNTSU
                && this.handcard[parseInt(mentsu) + 1]
                && this.handcard[mentsu].card == this.handcard[parseInt(mentsu) + 1].card) {
                peekooCount++
                if (this.handcard[parseInt(mentsu) - 1]
                    && this.handcard[mentsu].card == this.handcard[parseInt(mentsu) - 1].card) {
                    peekooCount--
                }
            }
        }
        return peekooCount
    }

    hasChiiToi() {
        return this.handcard.length == 7
    }

    hasSanShoku() {
        var oneToNine = new Array(10).fill(0)
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.SHUNTSU) {
                oneToNine[this.handcard[mentsu].card % 10]++
            }
        }
        //看有幾組起始數字相同的順子 但可能被盃口影響所以減掉
        for (const index in oneToNine) {
            if (oneToNine[index] - this.peeKoo() >= 3) {
                return true
            }
        }
        return false
    }

    hasSanDooKoo() {
        var oneToNine = new Array(10).fill(0)
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.KOOTSU) {
                oneToNine[this.handcard[mentsu].card % 10]++
            }
        }
        //看有幾組起始數字相同的刻子
        for (const index in oneToNine) {
            if (oneToNine[index] >= 3) {
                return true
            }
        }
        return false
    }

    hasIttsuu() {
        var manPinSuo = new Array(5).fill(0)
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.SHUNTSU && this.handcard[mentsu].card % 10 % 3 == 1) {
                manPinSuo[Math.floor(this.handcard[mentsu].card / 10)]++
            }
        }
        //看有幾組147開始的同系順子 但可能被盃口影響所以減掉
        for (const index in manPinSuo) {
            if (manPinSuo[index] - this.peeKoo() >= 3) {
                return true
            }
        }
        return false
    }

    hasToiToi() {
        return this.kooTsu() >= 4
    }

    hasSanAnKoo() {
        return this.kooTsu() >= 3
    }

    kooTsu() {
        var kootsuCount = 0
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.KOOTSU) {
                kootsuCount++
            }
        }
        return kootsuCount
    }

    hasChanTa() {
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.SHUNTSU) {
                if (!AgariCards.isYaoChuu(this.handcard[mentsu].card) && !AgariCards.isYaoChuu(this.handcard[mentsu].card + 2)) {
                    return false
                }
            } else {
                if (!AgariCards.isYaoChuu(this.handcard[mentsu].card)) {
                    return false
                }
            }
        }
        return true;
    }

    hasJunChan() {
        for (const mentsu in this.handcard) {
            if (AgariCards.isTsuuHai(this.handcard[mentsu].card)) {
                return false
            }
        }
        return this.hasChanTa()
    }

    hasHonRoo() {
        for (const mentsu in this.handcard) {
            if (!AgariCards.isYaoChuu(this.handcard[mentsu].card)) {
                return false
            }
        }
        return this.hasToiToi() || this.hasChiiToi()
    }

    hasShouSanGen() {
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].type == Mentsu.JANTOU && !AgariCards.isYakuHai(this.handcard[mentsu].card)) {
                return false
            }
        }
        return this.yakuHai() == 2
    }

    hasHonITsu() {
        var manPinSuo = new Array(5).fill(0)
        for (const mentsu in this.handcard) {
            if (!AgariCards.isTsuuHai(this.handcard[mentsu].card)) {
                manPinSuo[Math.floor(this.handcard[mentsu].card / 10)]++
            }
        }
        return !(manPinSuo[2] && manPinSuo[3] || manPinSuo[3] && manPinSuo[4] || manPinSuo[2] && manPinSuo[4])
    }

    hasChinITsu() {
        for (const mentsu in this.handcard) {
            if (AgariCards.isTsuuHai(this.handcard[mentsu].card)) {
                return false
            }
        }
        return this.hasHonITsu()
    }

    countDora(dora) {
        var doraCount = 0
        for (const mentsu in this.handcard) {
            if (this.handcard[mentsu].card == dora && this.handcard[mentsu].type == Mentsu.JANTOU) {
                doraCount += 2
            }
            if (this.handcard[mentsu].card == dora && this.handcard[mentsu].type == Mentsu.KOOTSU) {
                doraCount += 3
            }
            var shuntsuDora = dora - this.handcard[mentsu].card
            if (shuntsuDora >= 0 && shuntsuDora < 2 && this.handcard[mentsu].type == Mentsu.SHUNTSU) {
                doraCount += 1
            }
        }
        return doraCount
    }

    countHan() {
        var hanCount = 0
        for (const yaku in this.yakus) {
            hanCount += this.yakus[yaku].hanCount
        }
        return hanCount
    }

    countAgariType() {
        var message = ""
        if (this.score == 96000) {
            message = "ダブル役満"
        } else if (this.score == 48000) {
            if (this.yakus.length == 1) {
                message = "役満"
            } else {
                message = "数え役満"
            }
        } else if (this.score == 36000) {
            message = "三倍満"
        } else if (this.score == 24000) {
            message = "倍満"
        } else if (this.score == 18000) {
            message = "跳満"
        } else if (this.score == 12000) {
            message = "満貫"
        } else {
            message += this.han + "飜" + this.fu + "符"
        }
        return message
    }

    countScore() {
        var basis
        if (this.han == 26) {
            basis = 16000
        } else if (this.han >= 13) {
            basis = 8000
        } else if (this.han >= 11) {
            basis = 6000
        } else if (this.han >= 8) {
            basis = 4000
        } else if (this.han >= 6) {
            basis = 3000
        } else if (this.han == 5) {
            basis = 2000
        } else {
            basis = this.fu * Math.pow(2, this.han + 2)
            if (basis > 2000) {
                basis = 2000
            }
        }
        return Math.ceil(basis * 2 / 100) * 300
    }

    toString() {
        var result = ""
        result += this.agariType + "\t\t"
        result += this.score + "点" + "\n"
        for (const yaku in this.yakus) {
            result += this.yakus[yaku].toString
        }
        return result
    }

    static isYaoChuu(card) {
        const yaochuu = [0, 2, 4, 6, 10, 12, 14, 21, 29, 31, 39, 41, 49]
        return yaochuu.includes(card)
    }

    static isTsuuHai(card) {
        const tsuuhai = [0, 2, 4, 6, 10, 12, 14]
        return tsuuhai.includes(card)
    }

    static isYakuHai(card) {
        const yakuhai = [10, 12, 14]
        return yakuhai.includes(card)
    }

    static isFuuPai(card) {
        const fuupai = [0, 2, 4, 6]
        return fuupai.includes(card)
    }
}

//main
/*
var cards = ['21', '21', '21', '21', '22', '22', '23', 23, 31, 32, 33, 41, 42, 43]
var agariCards = agariJudger(cards, 29)
if (agariCards) {
    console.log(agariCards)

    console.log("結果：" + agariCards.agariType)
    console.log("飜數：" + agariCards.han)
    console.log("符數：" + agariCards.fu)
    console.log("點數：" + agariCards.score)
    console.log("斗拉：" + agariCards.dora)
    console.log("役種：")
    for (const yaku in agariCards.yakus) {
        console.log(agariCards.yakus[yaku].toString())
    }
}
*/