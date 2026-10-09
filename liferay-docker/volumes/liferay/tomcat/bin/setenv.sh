#!/bin/sh

# Heap and Metaspace memory allocations tailored for 16GB RAM Codespaces
CATALINA_OPTS="$CATALINA_OPTS -Xms4096m -Xmx6144m -XX:MetaspaceSize=768m -XX:MaxMetaspaceSize=1536m"

# Modern Garbage Collector optimized for low latency and smooth learning usage
CATALINA_OPTS="$CATALINA_OPTS -XX:+UseG1GC -XX:+ParallelRefProcEnabled"

# Encoding and headless display
CATALINA_OPTS="$CATALINA_OPTS -Dfile.encoding=UTF-8 -Djava.awt.headless=true"

# Disable development bundle remote agents if not needed
CATALINA_OPTS="$CATALINA_OPTS -Dorg.apache.catalina.loader.WebappClassLoader.ENABLE_CLEAR_REFERENCES=true"

export CATALINA_OPTS
