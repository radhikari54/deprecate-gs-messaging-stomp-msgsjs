#!/bin/sh
cd $(dirname $0)

curl -s get.gvmtool.net | bash
source "$HOME/.gvm/bin/gvm-init.sh"
sleep 5
echo "Y" | gvm install springboot

cd ../complete
spring run app.groovy &
sleep 30
curl -s http://localhost:8080 > actual.html
killall "java"

echo "Let's look at the actual results: `cat actual.html`"
echo "And compare it to: `cat ../test/expected.html`"

if diff -w ../test/expected.html actual.html
    then
        echo SUCCESS
        let ret=0
    else
        echo FAIL
        let ret=255
        exit $ret
fi
rm -rf actual.html

exit
