f = open("books/ops.txt", "r")
ops = f.read().split("\n")
formatted_openings = []
for op in ops:
    print(op.strip().split("\t"))
    formatted_openings.append(op.strip().split("\t"))

f.close()

newfile = open("books/openings.txt", "w")
for opening in formatted_openings:
    out = ", ".join(opening) + "\n"
    newfile.write(out)

newfile.close()
