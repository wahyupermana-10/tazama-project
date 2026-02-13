# Rule 903 - Large Transaction Detection
# Based on rule-901 image, dengan logika yang dimodifikasi

FROM tazamaorg/rule-901:rc

# Override environment variables untuk rule 903
ENV FUNCTION_NAME="rule-903-rel-1-0-0"
ENV RULE_VERSION="1.0.0"
ENV RULE_NAME="903"
ENV APM_SERVICE_NAME="rule-903"

# Note: Karena logika rule di-hardcode dalam image,
# kita tidak bisa mengubah logika tanpa rebuild dari source.
# Image ini akan tetap menggunakan logika rule-901 (count transactions)
# tapi dengan nama rule-903.

# Untuk rule dengan logika berbeda, perlu build dari source code lengkap.
