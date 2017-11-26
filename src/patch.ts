import parse from './parse';
import { Value, Comment } from './interfaces';

export default function patch(str: string, value: any) {
	const comments: Comment[] = [];
	const root: Value = parse(str, {
		onComment: comment => {
			comments.push(comment);
		}
	});
}

function patchValue(node: Value, value: any, comments: Comment[]) {

}