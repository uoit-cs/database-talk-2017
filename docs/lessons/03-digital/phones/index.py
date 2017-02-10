import os

files = os.listdir(".")
print '<div class="masonry" columns=5 width=400 height=400>'
for f in files:
    if f.endswith('png') or f.endswith('jpg'):
        print '<img src="phones/%s"></img>' % f

print "</div>"
