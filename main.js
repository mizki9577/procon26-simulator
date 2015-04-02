"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

// main.js

$(function () {
    // 敷地の幅と高さ (個数)
    var AREA_WIDTH = 32;
    var AREA_HEIGHT = 32;

    // ブロックの幅と高さ (px)
    var BLOCK_WIDTH = 16;
    var BLOCK_HEIGHT = 16;

    // 敷地の幅と高さ (px)
    var AREA_PIXEL_WIDTH = AREA_WIDTH * BLOCK_WIDTH;
    var AREA_PIXEL_HEIGHT = AREA_HEIGHT * BLOCK_HEIGHT;

    // 敷地の色
    var AREA_COLOR = "#FFFFFF";
    var AREA_BORDER_COLOR = "#000000";

    // 障害物の色
    var OBSTACLE_COLOR = "#000000";
    var OBSTACLE_BORDER_COLOR = "#FFFFFF";

    // カレントブロックの色
    var CURRENT_BLOCK_COLOR = "#777777";
    var CURRENT_BLOCK_BORDER_COLOR = "#777777";

    // 現在位置に置けないときの色
    var UNPUTTABLE_COLOR = "#FF0000";
    var UNPUTTABLE_BORDER_COLOR = "#00FFFF";

    // ブロックの色
    var BLOCK_COLOR = "#333333";
    var BLOCK_BORDER_COLOR = "#CCCCCC";

    // 敷地のブロックの各ビットの定数
    var EMPTY = 0; // 何もない
    var OBSTACLE = 1; // 障害物がある
    var BLOCK = 2; // 石が固定されている
    var CURRENT_BLOCK = 4; // 現在選択している石が置かれているがまだ固定されていない

    // 回転方向を表す定数
    var CW = 0,
        CCW = 1;

    // 平面の方向を表す定数
    var UP = 0,
        RIGHT = 1,
        DOWN = 2,
        LEFT = 3;

    // 表裏を表す定数
    var H = true,
        T = false;

    // キーコード
    var KEYCODE = new Map((function () {
        var _ref = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var c = _step.value;

                _ref.push([c, c.charCodeAt(0)]);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return _ref;
    })());

    // 初期問題データ
    var DEFAULT_PROBLEM = "00000000000000001111111111111111\r\n00000000000000001111111111111111\r\n01000000000000001111111111111111\r\n00000000000000001111111111111111\r\n00000000000000001111111111111111\r\n00000000000000001111111111111111\r\n00000000000000001111111111111111\r\n00000100000000001111111111111111\r\n00000000000000001111111111111111\r\n00000000000000001111111111111111\r\n00000000000000001111111111111111\r\n00000000010000001111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n11111111111111111111111111111111\r\n\r\n4\r\n01000000\r\n01000000\r\n01000000\r\n01000000\r\n01000000\r\n01000000\r\n01110000\r\n00000000\r\n\r\n00000000\r\n01100000\r\n01100000\r\n01100000\r\n01100000\r\n00000000\r\n00000000\r\n00000000\r\n\r\n00000000\r\n00010000\r\n00010000\r\n01111000\r\n00000000\r\n00000000\r\n00000000\r\n00000000\r\n\r\n10000000\r\n11000000\r\n01100000\r\n00110000\r\n00011000\r\n00001100\r\n00000110\r\n00000011";

    var ProconSimulator = (function () {
        function ProconSimulator() {
            _classCallCheck(this, ProconSimulator);

            this.area = [];
            this.stones = [];
            this.current_stone = [];
            this.game_over = false;
        }

        _createClass(ProconSimulator, {
            load_problem: {
                value: function load_problem(problem_text) {
                    // 問題をロードする

                    // 生データを空行で分割し、先頭の敷地データを分離し残りを石データのリストとする
                    var stones_text = problem_text.split(/\r?\n\r?\n/);
                    var area_text = stones_text.shift();

                    // 敷地データ文字列を数値型二次元配列に変換する
                    this.area = [];
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = area_text.split(/\r?\n/)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var row = _step.value;

                            this.area.push(row.split("").map(Number));
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator["return"]) {
                                _iterator["return"]();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }

                    // 石データ文字列を数値型二次元配列に変換する
                    this.stones = [];
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = stones_text[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var stone_text = _step2.value;

                            var stone = [];
                            var _iteratorNormalCompletion3 = true;
                            var _didIteratorError3 = false;
                            var _iteratorError3 = undefined;

                            try {
                                for (var _iterator3 = stone_text.split(/\r?\n/)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                    var row = _step3.value;

                                    stone.push(row.split("").map(Number));
                                }
                            } catch (err) {
                                _didIteratorError3 = true;
                                _iteratorError3 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                        _iterator3["return"]();
                                    }
                                } finally {
                                    if (_didIteratorError3) {
                                        throw _iteratorError3;
                                    }
                                }
                            }

                            this.stones.push(stone);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                _iterator2["return"]();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }

                    this.stones[0].shift(); // 最初の石の1行目はゴミ

                    // 諸々をリセットする
                    this.answer = "";
                    this.game_over = false;

                    // 最初の石を置く
                    this.pop_stone();
                }
            },
            pop_stone: {
                value: function pop_stone() {
                    // 石を石リストから取り出して左上に仮設する

                    // もう石がない場合
                    if (this.stones.length === 0) {
                        this.game_over = true;
                        return;
                    }

                    this.current_stone = this.stones.shift();
                    this.current_stone_x = 0;
                    this.current_stone_y = 0;
                    this.current_stone_w = this.current_stone[0].length;
                    this.current_stone_h = this.current_stone.length;
                    this.current_stone_ht = H;
                    this.current_stone_angle = 0;

                    for (var y = 0; y < this.current_stone_h; ++y) {
                        for (var x = 0; x < this.current_stone_w; ++x) {
                            if (this.current_stone[y][x]) {
                                this.area[y][x] |= CURRENT_BLOCK;
                            }
                        }
                    }
                }
            },
            put_stone: {
                value: function put_stone() {
                    // 石を現在の場所に確定する

                    // ゲームが終わっていたら何もしない
                    if (this.game_over) {
                        return;
                    }

                    // 置けない場合は何もしない
                    if (!this.now_puttable()) {
                        return;
                    }

                    var y_start = Math.max(0, this.current_stone_y);
                    var y_limit = Math.min(AREA_HEIGHT, this.current_stone_y + this.current_stone_h);
                    var x_start = Math.max(0, this.current_stone_x);
                    var x_limit = Math.min(AREA_WIDTH, this.current_stone_x + this.current_stone_w);

                    for (var y = y_start; y < y_limit; ++y) {
                        for (var x = x_start; x < x_limit; ++x) {
                            if (this.area[y][x] & CURRENT_BLOCK) {
                                this.area[y][x] &= ~CURRENT_BLOCK;
                                this.area[y][x] |= BLOCK;
                            }
                        }
                    }

                    // answer の更新
                    this.answer = this.answer.concat([this.current_stone_x, this.current_stone_y, this.current_stone_ht == H ? "H" : "T", this.current_stone_angle, "\n"].join(" "));

                    // 次の石へ
                    this.pop_stone();
                }
            },
            skip_stone: {
                value: function skip_stone() {
                    // 現在の石をスキップする

                    // ゲームが終わっていたら何もしない
                    if (this.game_over) {
                        return;
                    }

                    var y_start = Math.max(0, this.current_stone_y);
                    var y_limit = Math.min(AREA_HEIGHT, this.current_stone_y + this.current_stone_h);
                    var x_start = Math.max(0, this.current_stone_x);
                    var x_limit = Math.min(AREA_WIDTH, this.current_stone_x + this.current_stone_w);

                    for (var y = y_start; y < y_limit; ++y) {
                        for (var x = x_start; x < x_limit; ++x) {
                            if (this.area[y][x] & CURRENT_BLOCK) {
                                this.area[y][x] &= ~CURRENT_BLOCK;
                            }
                        }
                    }

                    // answer の更新
                    this.answer.concat("\n");

                    // 次の石へ
                    this.pop_stone();
                }
            },
            _refresh_current_stone: {
                value: function _refresh_current_stone(procedure) {
                    // 石の位置の更新を行うラッパ関数

                    if (this.current_stone === null) {
                        return;
                    }

                    var y_start = Math.max(0, this.current_stone_y);
                    var y_limit = Math.min(AREA_HEIGHT, this.current_stone_y + this.current_stone_h);
                    var x_start = Math.max(0, this.current_stone_x);
                    var x_limit = Math.min(AREA_WIDTH, this.current_stone_x + this.current_stone_w);

                    for (var y = y_start; y < y_limit; ++y) {
                        for (var x = x_start; x < x_limit; ++x) {
                            if (this.area[y][x] & CURRENT_BLOCK) {
                                this.area[y][x] &= ~CURRENT_BLOCK;
                            }
                        }
                    }

                    procedure();

                    for (var y = 0; y < this.current_stone_h; ++y) {
                        for (var x = 0; x < this.current_stone_w; ++x) {
                            if (this.current_stone[y][x]) {
                                if (0 <= x + this.current_stone_x && x + this.current_stone_x < AREA_WIDTH && 0 <= y + this.current_stone_y && y + this.current_stone_y < AREA_HEIGHT) {
                                    this.area[y + this.current_stone_y][x + this.current_stone_x] |= CURRENT_BLOCK;
                                }
                            }
                        }
                    }
                }
            },
            move_stone: {
                value: function move_stone(direction) {
                    var _this = this;

                    // 石を移動させる

                    // ゲームが終わっていたら何もしない
                    if (this.game_over) {
                        return;
                    }

                    this._refresh_current_stone(function () {
                        switch (direction) {
                            case UP:
                                --_this.current_stone_y;
                                break;
                            case DOWN:
                                ++_this.current_stone_y;
                                break;
                            case LEFT:
                                --_this.current_stone_x;
                                break;
                            case RIGHT:
                                ++_this.current_stone_x;
                                break;
                        }
                    });
                }
            },
            rotate_stone: {
                value: function rotate_stone(direction) {
                    var _this = this;

                    // 石を回転させる

                    // ゲームが終わっていたら何もしない
                    if (this.game_over) {
                        return;
                    }

                    this._refresh_current_stone(function () {
                        var rotated = [];
                        for (var y = 0; y < _this.current_stone_w; ++y) {
                            rotated.push(new Array(_this.current_stone_h));
                            for (var x = 0; x < _this.current_stone_h; ++x) {
                                if (direction == CW) {
                                    rotated[y][x] = _this.current_stone[_this.current_stone_h - x - 1][y];
                                } else if (direction == CCW) {
                                    rotated[y][x] = _this.current_stone[x][_this.current_stone_h - y - 1];
                                }
                            }
                        }
                        _this.current_stone = rotated;
                    });

                    if (direction == CW) {
                        this.current_stone_angle += 90;
                    } else if (direction == CCW) {
                        this.current_stone_angle -= 90;
                    }
                    this.current_stone_angle = (this.current_stone_angle + 360) % 360;
                }
            },
            flip_stone: {
                value: function flip_stone() {
                    var _this = this;

                    // 石を左右反転させる

                    // ゲームが終わっていたら何もしない
                    if (this.game_over) {
                        return;
                    }

                    this._refresh_current_stone(function () {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _this.current_stone[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var row = _step.value;

                                row.reverse();
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    });
                    this.current_stone_ht = this.current_stone_ht == H ? T : H;
                }
            },
            now_puttable: {
                value: function now_puttable() {
                    // 石を現在位置に置けるか調べる

                    // ゲームが終わっていたら何もしない
                    if (this.game_over) {
                        return;
                    }

                    var area_x = undefined,
                        area_y = undefined;

                    for (var y = 0; y < this.current_stone_h; ++y) {
                        for (var x = 0; x < this.current_stone_w; ++x) {
                            if (this.current_stone[y][x]) {
                                area_x = x + this.current_stone_x;
                                area_y = y + this.current_stone_y;

                                if (area_x < 0 || AREA_WIDTH <= area_x || area_y < 0 || AREA_HEIGHT <= area_y) {
                                    return false;
                                }

                                if (this.area[area_y][area_x] & (BLOCK | OBSTACLE)) {
                                    return false;
                                }
                            }
                        }
                    }

                    return true;
                }
            },
            get_score: {
                value: function get_score() {
                    // 得点を計算する

                    var score = AREA_WIDTH * AREA_HEIGHT;
                    for (var y = 0; y < AREA_HEIGHT; ++y) {
                        for (var x = 0; x < AREA_WIDTH; ++x) {
                            if (this.area[y][x] & (OBSTACLE | BLOCK)) {
                                --score;
                            }
                        }
                    }

                    return score;
                }
            }
        });

        return ProconSimulator;
    })();

    var draw = function (canvas, simulator) {
        // 描画を行う

        var fill_color = undefined,
            border_color = undefined,
            puttable = undefined;

        // ゲームオーバ判定
        if (simulator.game_over) {
            alert("GAME OVER!");
            puttable = true;
        } else {
            puttable = simulator.now_puttable();
        }

        for (var y = 0; y < AREA_HEIGHT; ++y) {
            for (var x = 0; x < AREA_WIDTH; ++x) {
                if (simulator.area[y][x] & CURRENT_BLOCK) {
                    if (puttable) {
                        fill_color = CURRENT_BLOCK_COLOR;
                        border_color = CURRENT_BLOCK_BORDER_COLOR;
                    } else {
                        fill_color = UNPUTTABLE_COLOR;
                        border_color = UNPUTTABLE_BORDER_COLOR;
                    }
                } else if (simulator.area[y][x] & BLOCK) {
                    fill_color = BLOCK_COLOR;
                    border_color = BLOCK_BORDER_COLOR;
                } else if (simulator.area[y][x] & OBSTACLE) {
                    fill_color = OBSTACLE_COLOR;
                    border_color = OBSTACLE_BORDER_COLOR;
                } else {
                    fill_color = AREA_COLOR;
                    border_color = AREA_BORDER_COLOR;
                }
                canvas.drawRect({
                    fromCenter: false,
                    fillStyle: fill_color,
                    strokeStyle: border_color,
                    x: x * BLOCK_WIDTH,
                    y: y * BLOCK_HEIGHT,
                    width: BLOCK_WIDTH,
                    height: BLOCK_HEIGHT
                });
            }
        }
    };

    // 初期化処理
    $(function () {
        var procon_simulator = new ProconSimulator();

        var refresh = function () {
            // いろいろを更新する
            draw($("#canvas"), procon_simulator);
            $("#score").text(procon_simulator.get_score());
            $("#answer").val(procon_simulator.answer);
        };

        var reload = function () {
            // 問題をリロードする
            procon_simulator.load_problem($("#problem-textarea").val());
            refresh();
        };

        // 問題データをテキストエリアに入力
        $("#problem-textarea").val(DEFAULT_PROBLEM);

        // canvas のサイズを設定する
        $("#canvas").attr("width", AREA_PIXEL_WIDTH).attr("height", AREA_PIXEL_HEIGHT);

        // 問題データをテキストエリアに入力
        $("#problem-textarea").val(DEFAULT_PROBLEM);

        // イベントの登録
        $(document).keydown(function (event) {
            if ($("#problem-textarea").is(event.target)) {
                // テキストエリアではイベントを捕捉しない
                return;
            }

            switch (event.which) {
                case KEYCODE.get("W"):
                    procon_simulator.move_stone(UP);
                    break;
                case KEYCODE.get("A"):
                    procon_simulator.move_stone(LEFT);
                    break;
                case KEYCODE.get("S"):
                    procon_simulator.move_stone(DOWN);
                    break;
                case KEYCODE.get("D"):
                    procon_simulator.move_stone(RIGHT);
                    break;
                case KEYCODE.get("Q"):
                    procon_simulator.rotate_stone(CCW);
                    break;
                case KEYCODE.get("E"):
                    procon_simulator.rotate_stone(CW);
                    break;
                case KEYCODE.get("R"):
                    procon_simulator.flip_stone();
                    break;
                case KEYCODE.get("Z"):
                    procon_simulator.put_stone();
                    break;
                case KEYCODE.get("F"):
                    procon_simulator.skip_stone();
                    break;
                default:
                    return true;
            }

            refresh();
            return false;
        });
        $("#problem-textarea").change(reload);
        $("#problem-textarea").keyup(reload);
        $("#reset").click(reload);

        reload();
    });
});

// vim: ft=javascript ts=4 sw=4 et:
