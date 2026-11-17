import { OPTION_KEYS, type QuizOption, type QuizOptionProps } from './quiz.entity';

export class QuestionFactory {
  createOptions(correctOption: string, incorrectOptions: string[]): QuizOptionProps[] {
    const texts = this.shuffle([correctOption, ...incorrectOptions]);
    return texts.map((text, index) => ({
      key: OPTION_KEYS[index],
      text,
      isCorrect: text === correctOption,
    }));
  }

  resolveExplanation(statement: string, correct: QuizOption, explanation: string): string {
    const custom = explanation.trim();
    if (custom) {
      return custom;
    }
    return `En "${statement}" la respuesta correcta es la opción ${correct.key}: "${correct.text}".`;
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }
}
