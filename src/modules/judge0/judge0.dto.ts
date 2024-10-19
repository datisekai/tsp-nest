import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class SubmitJudge0Dto {
  @IsString()
  @IsNotEmpty()
  source_code: string;

  @IsInt()
  @IsNotEmpty()
  language_id: number;

  @IsString()
  @IsNotEmpty()
  stdin: string;

  @IsString()
  @IsNotEmpty()
  expected_output: string;
}

type Status = {
  id: number;
  description: string;
};

export type Judge0Submit = {
  stdout: string;
  time: string;
  memory: number;
  stderr: null;
  token: string;
  compile_output: null;
  message: null;
  status: Status;
};
