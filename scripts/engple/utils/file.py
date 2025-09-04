def read_file(path: str) -> str:
    """
    Read a file and return the content as a string.
    """
    with open(path, "r") as f:
        res = f.read()
        return res
