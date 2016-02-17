start_time = Time.now

puts "Hello! It's #{start_time} and CI is just starting!"

`make check`

puts "CI finished in #{Time.now - start_time}"

puts 'Bye!'
