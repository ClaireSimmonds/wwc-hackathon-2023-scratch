import argparse
import io


def split_csv(filename, chunk_size):
    with open(filename) as infile:
        header = infile.readline()

        output_buffer = io.StringIO()
        counter = 0

        for line in infile:
            if output_buffer.tell() + len(line) < chunk_size:
                output_buffer.write(line)
            else:
                write_csv(generate_output_filename(filename, counter), header, output_buffer.getvalue())
                output_buffer.close()
                counter += 1
                output_buffer = io.StringIO() 
                output_buffer.write(line)

        write_csv(generate_output_filename(filename, counter), header, output_buffer.getvalue())
        output_buffer.close()


def generate_output_filename(filename, offset):
    return f"{filename.strip('.csv')}_{offset}.csv"


def write_csv(filename, header, data):
    with open(filename, 'w') as outfile:
        outfile.write(header)
        outfile.write(data)


def main():
    parser = argparse.ArgumentParser(prog='split_csv', description='Splits provided CSV file into chunks of a given size')
    parser.add_argument("filename", help="Filename and path of the CSV to be split")
    parser.add_argument("--chunk_size", help="Desired size in bytes of output CSV files", default=5000000)

    args = parser.parse_args()
    split_csv(args.filename, args.chunk_size)


if __name__ == '__main__':
    main()