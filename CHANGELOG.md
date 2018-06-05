# golden-fleece changelog

## 1.0.9

* Various fixes/improvements to number patching ([#16](https://github.com/Rich-Harris/golden-fleece/issues/16))

## 1.0.8

* Oops, publish fail

## 1.0.7

* Handle `\x` and `\u` sequences ([#12](https://github.com/Rich-Harris/golden-fleece/pull/12))
* Correctly stringify backslashes etc ([#13](https://github.com/Rich-Harris/golden-fleece/pull/13))

## 1.0.6

* Fix stringification of strings with characters that need to be escaped ([#10](https://github.com/Rich-Harris/golden-fleece/pull/10))
* Correctly patch objects with no properties in common ([#9](https://github.com/Rich-Harris/golden-fleece/pull/9))
* Remove `locate-character` from dependencies (it is bundled) ([#11](https://github.com/Rich-Harris/golden-fleece/pull/11))

## 1.0.5

* Correctly handle newlines ([#6](https://github.com/Rich-Harris/golden-fleece/issues/6))

## 1.0.4

* Ensure keys are properly quoted ([#3](https://github.com/Rich-Harris/golden-fleece/pull/3))
* Make options... optional ([#4](https://github.com/Rich-Harris/golden-fleece/pull/4))

## 1.0.3

* Remove excess newlines when stringifying objects

## 1.0.2

* Incorporate JSON5 tests to ensure compliance
* Various parser fixes

## 1.0.1

* Implement `onValue`
* Fix indentation of multiline arrays and objects
* Allow numbers to have `+` prefix
* Support hex/binary notation
* Preserve number styles

## 1.0.0

* First release