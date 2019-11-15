trap "kill 0" EXIT

function get_pids () {
  PID="$1"
  PIDS="$PID"
  if [[ "$(pgrep -P $PID)" == "" ]]
  then
    echo -n ""
  else
    for P in $(pgrep -P $PID)
    do
      CHILDS_PIDS=$(get_pids $P)
      PIDS="$PIDS $CHILDS_PIDS"
    done
  fi
  echo -n $PIDS
}

yarn run server &
PID=$!
while inotifywait -r -e modify src
do
  PIDS=$(get_pids $PID)
  echo kill $PIDS
  kill $PIDS
  yarn run server &
  PID=$!
done
