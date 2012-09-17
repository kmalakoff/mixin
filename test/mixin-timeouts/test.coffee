$(->
  module("Mixin.Timeouts")

  # import Mixin
  Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js') else window.Mixin
  unless Mixin
    Mixin = if not window.Mixin and (typeof(require) != 'undefined') then require('mixin-js') else window.Mixin
  Mixin.DEBUG = true
  require('lib/mixin-timeouts') if not Mixin.Timeouts and (typeof(require) != 'undefined')

  test("TEST DEPENDENCY MISSING", ->
    ok(!!Mixin); ok(!!Mixin.Timeouts)
  )

  test("Use case: setup errors", ->
    class TimeoutErrors
      constructor: ->
        Mixin.in(this, 'Timeouts')
    instance = new TimeoutErrors()

    # timeout name as string is mandatory
    raises((->instance.addTimeout()), Error, "Mixin.Timeouts: missing timeout_name on 'TimeoutErrors'")
    raises((->instance.addTimeout(0)), Error, "Mixin.Timeouts: timeout_name invalid on 'TimeoutErrors'")
    raises((->instance.addTimeout({})), Error, "Mixin.Timeouts: timeout_name invalid on 'TimeoutErrors'")
    raises((->instance.addTimeout([])), Error, "Mixin.Timeouts: timeout_name invalid on 'TimeoutErrors'")
    raises((->instance.addTimeout(instance)), Error, "Mixin.Timeouts: timeout_name invalid on 'TimeoutErrors'")
    raises((->instance.addTimeout(TimeoutErrors)), Error, "Mixin.Timeouts: timeout_name invalid on 'TimeoutErrors'")

    # timeout name as function is mandatory
    raises((->instance.addTimeout('TimeoutName')), Error, "Mixin.Timeouts: missing callback on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', 0)), Error, "Mixin.Timeouts: callback invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', {})), Error, "Mixin.Timeouts: callback invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', [])), Error, "Mixin.Timeouts: callback invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', instance)), Error, "Mixin.Timeouts: callback invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', TimeoutErrors)), Error, "Mixin.Timeouts: callback invalid for timeout 'TimeoutName' on 'TimeoutErrors'")

    # wait as integer is mandatory
    raises((->instance.addTimeout('TimeoutName', (->))), Error, "Mixin.Timeouts: missing wait for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', (->), -2)), Error, "Mixin.Timeouts: wait invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', (->), 0.101)), Error, "Mixin.Timeouts: wait invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', (->), {})), Error, "Mixin.Timeouts: wait invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', (->), [])), Error, "Mixin.Timeouts: wait invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', (->), instance)), Error, "Mixin.Timeouts: wait invalid for timeout 'TimeoutName' on 'TimeoutErrors'")
    raises((->instance.addTimeout('TimeoutName', (->), TimeoutErrors)), Error, "Mixin.Timeouts: wait invalid for timeout 'TimeoutName' on 'TimeoutErrors'")

    # can only add once
    instance.addTimeout('AddTwiceOops', (->), 10)
    raises((->instance.addTimeout('AddTwiceOops', (->), 10)), Error, "Mixin.Timeouts: timeout 'AddTwiceOops' already exists on 'TimeoutErrors'")
  )

  test("Use case: one time timeout", ->
    stop()

    call_count = 0
    class ClassWithMemberTimeout
      constructor: ->
        Mixin.in(this, 'Timeouts')
        @addTimeout('SomeTimeout', (=> @callOnceAndDestroy()), 50)
      destroy: ->
        Mixin.out(this, 'Timeouts')
      callOnceAndDestroy: ->
        call_count++
        # cleanup to avoid memory leaks
        @destroy()

    # two instances so two calls
    instance1 = new ClassWithMemberTimeout()
    equal(instance1.timeoutCount(), 1, '1 timeout')
    deepEqual(instance1.timeouts(), ['SomeTimeout'], 'SomeTimeout timeout')
    instance2 = new ClassWithMemberTimeout()
    equal(instance2.timeoutCount(), 1, '1 timeout')
    deepEqual(instance2.timeouts(), ['SomeTimeout'], 'SomeTimeout timeout')

    # mixout kills timeouts
    instance3 = new ClassWithMemberTimeout()
    equal(instance3.timeoutCount(), 1, '1 timeout')
    deepEqual(instance3.timeouts(), ['SomeTimeout'], 'SomeTimeout timeout')
    instance3.destroy()

    setTimeout((->
      equal(call_count, 2, 'timeout was called twice')
      start()
    ), 100)
  )

  test("Use case: thrice-called timeout", ->
    stop()

    class ClassWithMemberThriceTimeout # ok, I just wanted to use Thrice!
      constructor: ->
        Mixin.in(this, 'Timeouts')
        @call_count = 0
        @addTimeout('SomeTimeout', (=> @callThriceAndDestroy()), 20)
      destroy: ->
        Mixin.out(this, 'Timeouts')
      callThriceAndDestroy: ->
        @call_count++
        if @call_count < 3
          @addTimeout('SomeTimeout', (=> @callThriceAndDestroy()), 20)
        else
          # cleanup to avoid memory leaks
          @destroy()

    instance = new ClassWithMemberThriceTimeout()
    equal(instance.timeoutCount(), 1, '1 timeout')
    deepEqual(instance.timeouts(), ['SomeTimeout'], 'SomeTimeout timeout')

    setTimeout((->
      # cleanup to avoid memory leaks
      Mixin.out(instance, 'Timeouts')

      equal(instance.call_count, 3, 'timeout was called three times')
      start()
    ), 100)
  )

  test("Use case: killing timeouts", ->
    stop()

    class TimeoutKiller
    instance = new TimeoutKiller()
    call_interval = 40
    call_count = 0
    call_and_call_again = => call_count++; instance.addTimeout('CallAgain', call_and_call_again, call_interval)

    # mix into instance
    Mixin.in(instance, 'Timeouts')
    equal(instance.timeoutCount(), 0, 'no timeouts')
    deepEqual(instance.timeouts(), [], 'no timeouts by name')

    # add and kill all before called
    instance.addTimeout('TryToCallAgain1', call_and_call_again, call_interval)
    instance.addTimeout('TryToCallAgain2', call_and_call_again, call_interval)
    equal(instance.timeoutCount(), 2, '2 timeouts')
    equal(instance.hasTimeout('TryToCallAgain1'), true, 'has TryToCallAgain1 timeout')
    equal(instance.hasTimeout('TryToCallAgain2'), true, 'has TryToCallAgain1 timeout')
    instance.killAllTimeouts()
    equal(instance.timeoutCount(), 0, 'no timeouts')
    deepEqual(instance.timeouts(), [], 'no timeouts by name')
    equal(instance.hasTimeout('TryToCallAgain1'), false, 'does not have TryToCallAgain1 timeout')
    equal(instance.hasTimeout('TryToCallAgain2'), false, 'does not have TryToCallAgain2 timeout')

    # add and kill by name before called
    instance.addTimeout('CallAgain', call_and_call_again, call_interval)
    instance.addTimeout('TryToCallAgain', call_and_call_again, call_interval)
    equal(instance.timeoutCount(), 2, '2 timeouts')
    equal(instance.hasTimeout('CallAgain'), true, 'has CallAgain timeout')
    equal(instance.hasTimeout('TryToCallAgain'), true, 'has TryToCallAgain timeout')
    instance.killTimeout('TryToCallAgain')
    equal(instance.timeoutCount(), 1, '1 timeouts')
    equal(instance.hasTimeout('CallAgain'), true, 'has CallAgain timeout')
    equal(instance.hasTimeout('TryToCallAgain'), false, 'has TryToCallAgain timeout')

    # attempt to kill non-existent timeouts
    raises((=> instance.killTimeout('Nope')), Error, "Mixin.Timeouts: timeout 'Nope' does not exist. For a less-strict check, use killTimeoutIfExists")
    ok(instance.killTimeoutIfExists('Nope')==instance, 'no assertion to kill a non-existent timeout with killTimeoutIfExists')

    setTimeout((->
      # cleanup to avoid memory leaks
      Mixin.out(instance, 'Timeouts')

      equal(call_count, 2, 'timeout was called 2 times')
      start()
    ), 100)
  )

  test("Use case: chaining", ->
    stop()

    class TimeoutChainer
      constructor: ->
        Mixin.in(this, 'Timeouts')
    instance = new TimeoutChainer()
    call_count = 0
    call_me = => call_count++

    # add and kill 2
    instance.addTimeout('Chain1', call_me, 40).killTimeout('Chain1')
    equal(instance.timeoutCount(), 0, '0 timeouts')
    equal(instance.hasTimeout('Chain1'), false, 'does not have Chain1 timeout')

    # add 3 and keep 1
    instance.addTimeout('Chain1', call_me, 40).addTimeout('Chain2', call_me, 40).addTimeout('ChainCalled1', call_me, 40)
    equal(instance.timeoutCount(), 3, '3 timeouts')
    equal(instance.hasTimeout('Chain1'), true, 'does have Chain1 timeout')
    equal(instance.hasTimeout('Chain2'), true, 'does have Chain2 timeout')
    instance.killTimeout('Chain1').killTimeout('Chain2')
    equal(instance.timeoutCount(), 1, '1 timeouts')
    equal(instance.hasTimeout('Chain1'), false, 'does not have Chain1 timeout')
    equal(instance.hasTimeout('Chain2'), false, 'does not have Chain2 timeout')
    equal(instance.hasTimeout('ChainCalled1'), true, 'does have ChainCalled1 timeout')

    # add 2
    instance.addTimeout('ChainCalled2', call_me, 40).addTimeout('ChainCalled3', call_me, 60)

    setTimeout((->
      # cleanup to avoid memory leaks
      Mixin.out(instance, 'Timeouts')

      equal(call_count, 3, 'timeout was called 3 times')
      start()
    ), 100)
  )
)