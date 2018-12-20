// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import { calculateFrameIndex } from '../../content/utils'

describe('utils', () => {
  describe('calculate frame index', () => {
    it('when recording indicator index is undefined', () => {
      expect(calculateFrameIndex({ targetFrameIndex: 0 })).toEqual(0)
      expect(calculateFrameIndex({ targetFrameIndex: 1 })).toEqual(1)
      expect(calculateFrameIndex({ targetFrameIndex: 2 })).toEqual(2)
    })
    it('when recording indicator index is < 0', () => {
      expect(
        calculateFrameIndex({ indicatorIndex: -1, targetFrameIndex: 0 })
      ).toEqual(0)
      expect(
        calculateFrameIndex({ indicatorIndex: -2, targetFrameIndex: 1 })
      ).toEqual(1)
      expect(
        calculateFrameIndex({ indicatorIndex: -10, targetFrameIndex: 2 })
      ).toEqual(2)
    })
    it('when recording indicator index is 0', () => {
      expect(
        calculateFrameIndex({ indicatorIndex: 0, targetFrameIndex: 1 })
      ).toEqual(0)
      expect(
        calculateFrameIndex({ indicatorIndex: 0, targetFrameIndex: 2 })
      ).toEqual(1)
      expect(
        calculateFrameIndex({ indicatorIndex: 0, targetFrameIndex: 3 })
      ).toEqual(2)
    })
    it('when recording indicator index is 1', () => {
      expect(
        calculateFrameIndex({ indicatorIndex: 1, targetFrameIndex: 0 })
      ).toEqual(0)
      expect(
        calculateFrameIndex({ indicatorIndex: 1, targetFrameIndex: 2 })
      ).toEqual(1)
      expect(
        calculateFrameIndex({ indicatorIndex: 1, targetFrameIndex: 3 })
      ).toEqual(2)
    })
    it('when recording indicator index is 2', () => {
      expect(
        calculateFrameIndex({ indicatorIndex: 2, targetFrameIndex: 0 })
      ).toEqual(0)
      expect(
        calculateFrameIndex({ indicatorIndex: 2, targetFrameIndex: 1 })
      ).toEqual(1)
      expect(
        calculateFrameIndex({ indicatorIndex: 2, targetFrameIndex: 3 })
      ).toEqual(2)
    })
    it('when recording indicator index is 4', () => {
      expect(
        calculateFrameIndex({ indicatorIndex: 4, targetFrameIndex: 7 })
      ).toEqual(6)
    })
  })
})
